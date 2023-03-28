
const getContent = valueMessage => {
    let completMessage = '';
    for (let i = 1; i < valueMessage.length; i++) {
        completMessage += valueMessage[i] + ' '
    }
    return completMessage;
}