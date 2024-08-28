import axios from 'axios';

const server_url = 'https://8.140.226.160:4999/'
const api_call = {
    'generateStory':'generate_story',
    'setStoryAndChapter':'set_story_and_chapter',
    'getStoryAndChapter':'get_story_and_chapter',
    'voiceToText':'voice2text',
    'textToVoice':'text2voice',
    'restart':'restart_new_story',
    'extractKeyword':'extract_keyword',
    'uploadImage':'save_image',
    'downloadImage':'download_image',
    'drawbackContext':'drawback_context',
    'setTesterName':'set_tester_name',
    'generateImage':'generate_image',
    'generateOutline':'generate_outline',
    'splitStory':'split_story',
    'extractBackground':'extract_background',
    'extractCharacter':'extract_character'
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
            timeout: 30000,
        });
        console.log('Response received:', response);
        return response.data;
    } catch (error) {
        console.error('Error in sendAudioFile:', error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
        }
        console.error('Error config:', error.config);
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }
        
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

async function uploadImage(url, ImageFile, customFilename) {
    const formData = new FormData();
    formData.append('imgfile', ImageFile);
    formData.append('filename', customFilename);

    try {
        const response = await axios.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        console.log('Image upload response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error uploading image:', error);
        return null;
    }
}

async function downloadImage(url, ImageFileName) {
    try {
        const response = await axios.post(url, {
            filename: ImageFileName
        }, {
            headers: {
            'Content-Type': 'application/json'
            },
            responseType: 'blob' // 设置响应类型为blob
        });

        console.log('Image download response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error downloading image:', error);
        return null;
    }
}

export async function updateStory(storyIndex, chapterIndex) {
    console.log("updateStory" + storyIndex + " " + chapterIndex);
    var jsonString = JSON.stringify({
        story_index:storyIndex,
        chapter_index:chapterIndex,
    });
    console.log(jsonString);
    return postJsonData(server_url+api_call['setStoryAndChapter'], jsonString)
}

export async function generateStory(storyIndex, chapterIndex, message) {
    var jsonString = JSON.stringify({
        story_index:storyIndex,
        chapter_index:chapterIndex,
        message:message,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['generateStory'], jsonString);
    if (data === null || typeof data !== 'string') {
        return null;
    }
    console.log("generate story data:" + data);
    let processedData = data
        .replace(/“/g, '"') // 全局替换左双引号
        .replace(/”/g, '"') // 全局替换右双引号
        .replace(/\\n/g, '') // 全局替换转义的换行符
        .replace(/```json/g, '')
        .replace(/```/g, '');

    console.log("generate story data:", processedData);

    try {
        const parsedData = JSON.parse(processedData);
        return parsedData;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
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
  return new Promise((resolve) => {
    const audio = new Audio(audioUrl);
    audio.onended = resolve;
    audio.play();
  });
}

export async function restartNewStory() {
    console.log("restart new story")
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

export async function uploadImageToServer(imageFile, customFilename) {
    return uploadImage(server_url+api_call['uploadImage'], imageFile, customFilename);
}

export async function downloadImageFromServer(imageFileName) {
    return downloadImage(server_url+api_call['downloadImage'], imageFileName);
}

export async function drawbackContext(drawbackCnt) {
    var jsonString = JSON.stringify({
        drawback_cnt:drawbackCnt,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['drawbackContext'], jsonString);
    return data;
}

export async function setTesterName(tester) {
    var jsonString = JSON.stringify({
        tester_name:tester,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['setTesterName'], jsonString);
    return data;
}

export async function generateImage(prompt) {
    var jsonString = JSON.stringify({
        prompt:prompt,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['generateImage'], jsonString);
    return data;
}

export async function generateOutline(story, keyword, target) {
    var jsonString = JSON.stringify({
        story_text:story,
        keyword:keyword,
        target:target
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['generateOutline'], jsonString);
    return data;
}

export async function splitStory(story) {
    var jsonString = JSON.stringify({
        story_text:story,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['splitStory'], jsonString);
    let processedData = data
        .replace(/“/g, '"') // 全局替换左双引号
        .replace(/”/g, '"') // 全局替换右双引号
        .replace(/\\n/g, '') // 全局替换转义的换行符
        .replace(/```json/g, '')
        .replace(/```/g, '');

    console.log("generate story data:", processedData);

    try {
        const parsedData = JSON.parse(processedData);
        return parsedData;
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return null;
    }
}

export async function extractBackground(story) {
    var jsonString = JSON.stringify({
        story_text:story,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['extractBackground'], jsonString);
    return data;
}

export async function extractCharacter(story) {
    var jsonString = JSON.stringify({
        story_text:story,
    });
    console.log(jsonString);
    const data = await postJsonData(server_url+api_call['extractCharacter'], jsonString);
    return data;
}