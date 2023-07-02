export const getContent = valueMessage => {
    let completMessage = '';
    for (let i = 1; i < valueMessage.length; i++) {
        completMessage += valueMessage[i] + ' '
    }
    return completMessage;
}

export function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return (match && match[7].length == 11) ? match[7] : false;
}

export const validateUrl = url => {
    const youtubeUrlPattern = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return youtubeUrlPattern.test(url);
}

export function playlistIds(url) {
    const urlParams = new URLSearchParams(url);
    const playlistId = urlParams.get('list');

    return { playlistId };
}