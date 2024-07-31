import axios from 'axios';

const server_url = 'http://127.0.0.1:4999/'
const api_call = {
    'generateStory':'generate_story',
    'setStoryAndChapter':'set_story_and_chapter',
    'getStoryAndChapter':'get_story_and_chapter',
    'voiceToText':'voice2text',
    'textToVoice':'text2voice',
    'restart':'restart_new_story',
    'extractKeyword':'extract_keyword',
}

async function postJsonData(url, jsonData) {
    try {
        const response = await axios.post(url, jsonData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error in postJsonData:', error);
        return null;
    }
}

async function sendAudioFile(url, audioFile) {
    const formData = new FormData();
    formData.append('audiofile', audioFile);

    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error in sendAudioFile:', error);
        return null;
    }
}

async function sendJsonAndReceiveAudio(url, jsonData) {
    try {
        const response = await axios.post(server_url+api_call['textToVoice'], jsonData, {
            headers: {
                'Content-Type': 'application/json',
            },
            responseType: 'blob', // 设置响应类型为blob
        });

        console.log('Response data type:', response.data.type);
        console.log('Response data size:', response.data.size);

        const url = URL.createObjectURL(response.data);

        return url;
    } catch (error) {
        console.error('Error in sendJsonAndReceiveAudio:', error);
        return null;
    }
}

export function updateStory(storyIndex, chapterIndex) {
    var jsonString = JSON.stringify({
        story_index:storyIndex,
        chapter_index:chapterIndex,
    });
    console.log(jsonString);
    return postJsonData(server_url+api_call['setStoryAndChapter'], jsonString)
}

export async function generateStory(message) {
    var jsonString = JSON.stringify({
        message:message,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['generateStory'], jsonString);
    data.replace('“','\"');
    data.replace('”','\"');
    return JSON.parse(data);
}

export function getText2Voice(text) {
    var jsonString = JSON.stringify({
        text:text,
    });
    console.log(jsonString)
    return sendJsonAndReceiveAudio(server_url+api_call['textToVoice'], jsonString)
}

export function getVoice2Text(audioFile) {
    return sendAudioFile(server_url+api_call['voiceToText'], audioFile);
}

export function playSound(audioUrl) {
    const audioPlayer = document.getElementById('audioPlayer');
    audioPlayer.src = audioUrl;
    audioPlayer.play();
    audioPlayer.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
    });
}

export function restartNewStory() {
    var jsonString = JSON.stringify({});
    return postJsonData(server_url+api_call['restart'], jsonString)
}

export async function extractKeyword(message) {
    var jsonString = JSON.stringify({
        message:message,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['extractKeyword'], jsonString);
    console.log(data);
    return data;
}