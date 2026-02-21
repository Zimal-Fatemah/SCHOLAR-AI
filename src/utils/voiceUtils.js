import { useState, useRef, useEffect } from 'react';

export class TextToSpeech {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
  }

  speak(text, options = {}) {
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    utterance.lang = options.lang || 'en-US';

    if (options.voice) {
      utterance.voice = options.voice;
    }

    if (options.onEnd) {
      utterance.onend = options.onEnd;
    }

    if (options.onError) {
      utterance.onerror = options.onError;
    }

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  pause() {
    this.synth.pause();
  }

  resume() {
    this.synth.resume();
  }

  getVoices() {
    return this.synth.getVoices();
  }

  isSpeaking() {
    return this.synth.speaking;
  }
}

export class SpeechToText {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.isListening = false;
  }

  start(onResult, onError, options = {}) {
    if (this.isListening) return;

    this.recognition.lang = options.lang || 'en-US';
    
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      onResult({ final: finalTranscript.trim(), interim: interimTranscript });
    };

    this.recognition.onerror = (event) => {
      if (onError) onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (options.onEnd) options.onEnd();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      if (onError) onError(error.message);
    }
  }

  stop() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getListeningState() {
    return this.isListening;
  }
}

export function useTextToSpeech() {
  const ttsRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    ttsRef.current = new TextToSpeech();
    
    const loadVoices = () => {
      const availableVoices = ttsRef.current.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (ttsRef.current) {
        ttsRef.current.stop();
      }
    };
  }, []);

  const speak = (text, options = {}) => {
    setIsSpeaking(true);
    ttsRef.current.speak(text, {
      ...options,
      onEnd: () => {
        setIsSpeaking(false);
        if (options.onEnd) options.onEnd();
      },
      onError: (error) => {
        setIsSpeaking(false);
        if (options.onError) options.onError(error);
      }
    });
  };

  const stop = () => {
    ttsRef.current.stop();
    setIsSpeaking(false);
  };

  const pause = () => {
    ttsRef.current.pause();
  };

  const resume = () => {
    ttsRef.current.resume();
  };

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    voices
  };
}

export function useSpeechToText() {
  const sttRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      sttRef.current = new SpeechToText();
    } catch (err) {
      setError(err.message);
    }

    return () => {
      if (sttRef.current) {
        sttRef.current.stop();
      }
    };
  }, []);

  const startListening = (options = {}) => {
    if (!sttRef.current) {
      setError('Speech recognition not available');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    
    sttRef.current.start(
      ({ final, interim }) => {
        if (final) {
          setTranscript(prev => prev + ' ' + final);
        }
        setInterimTranscript(interim);
      },
      (err) => {
        setError(err);
        setIsListening(false);
      },
      {
        ...options,
        onEnd: () => {
          setIsListening(false);
          if (options.onEnd) options.onEnd();
        }
      }
    );

    setIsListening(true);
  };

  const stopListening = () => {
    if (sttRef.current) {
      sttRef.current.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    startListening,
    stopListening,
    resetTranscript,
    isListening,
    transcript,
    interimTranscript,
    error
  };
}
