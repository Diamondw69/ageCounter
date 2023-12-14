import React, {useState, useEffect, useCallback} from 'react';
import './Cake.css';
import cakeImage from './cake.png';
import candleImage from './candle.png';



const Cake = () => {
    const [candles, setCandles] = useState([]);
    const [age, setAge] = useState(0);
    const [isListening, setIsListening] = useState(false);
    const [audioStream, setAudioStream] = useState(null);
    const [audioData, setAudioData] = useState({ audioContext: null, analyser: null });
    const [lastRemoved, setLastRemoved] = useState(Date.now());

    const removeCandle = useCallback(() => {
        const currentTime = Date.now();
        if (candles.length > 0 && currentTime - lastRemoved > 1000) { // 1-second debounce
            setCandles(candles.slice(0, -1));
            setAge(age - 1);
            setLastRemoved(currentTime);
        }
    }, [candles, age, lastRemoved]);








    const addCandle = (event) => {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        setAge(age + 1);
        setCandles([...candles, { x, y }]);
    };

    const toggleListening = async () => {
        if (!isListening) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                setAudioStream(stream);
                await startListening(stream);
            } catch (err) {
                console.error('Could not access microphone', err);
            }
        } else {
            stopListening();
        }
    };

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.fftSize = 2048;

            setAudioData({ audioContext, analyser });
            setIsListening(true);
        } catch (err) {
            console.error('Could not access microphone', err);
        }
    };

    const stopListening = () => {
        if (audioData.audioContext) {
            audioData.audioContext.close(); // Close the audio context
        }
        setIsListening(false);
    };

    useEffect(() => {
        const checkAudio = () => {
            if (!isListening) return;

            const bufferLength = audioData.analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            audioData.analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            let average = sum / bufferLength;

            if (average > 20) {
                removeCandle();
            }

            requestAnimationFrame(checkAudio);
        };

        if (isListening) {
            checkAudio();
        }
    }, [isListening, audioData,removeCandle]);

    useEffect(() => {
        return () => {
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
            // Any other cleanup logic
        };
    }, [audioStream, removeCandle]);



    return (
        <div>
            <div className="cake-container" onClick={addCandle}>
                <img src={cakeImage} alt="Birthday Cake" />
                {candles.map((candle, index) => (
                    <img
                        key={index}
                        src={candleImage}
                        className="candle"
                        style={{ top: `${candle.y}px`, left: `${candle.x}px` }}
                        alt="Candle"
                    />
                ))}
                <div className="age-display">{age}</div>
            </div>
            <button onClick={toggleListening}>
                {isListening ? 'Stop Blowing' : 'Blow out Candles'}
            </button>
        </div>
    );
};

export default Cake;
