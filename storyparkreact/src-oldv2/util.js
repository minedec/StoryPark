import axios from 'axios';

const server_url = 'http://127.0.0.1:4999/'
const api_call = {
    'generateStory':'generate_story',
    'setStoryAndChapter':'set_story_and_chapter',
    'getStoryAndChapter':'get_story_and_chapter'
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
        const response = await axios.post(url, jsonData, {
            headers: {
                'Content-Type': 'application/json',
            },
            responseType: 'blob', // 设置响应类型为blob
        });

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

export function generateStory(message) {
    var jsonString = JSON.stringify({
        message:message,
    });
    console.log(jsonString);
    return postJsonData(server_url+api_call['generateStory'], jsonString)
}