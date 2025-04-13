/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-var */
interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
}

declare var SpeechRecognition: any;
declare var webkitSpeechRecognition: any;