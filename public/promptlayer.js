// Credit to Dominic Nguyen https://twitter.com/domng_me for making this helper function
export default async function promptLayer(tags, engine, functionName, prompt, messages, requestResponse, requestStartTime, requestEndTime) {
  let PROMPTLAYER_API_KEY = 'pl_58c77bf64c9e66d44d273917bc896ad9'
  
  if (prompt === null && messages === null) {
    console.error('promptLayer', 'no prompt or messages')
    return Promise.resolve();
  }

  var kwargs = {"engine": engine};
  if (messages !== null) {
    kwargs["messages"] = messages;
  } 
  if (prompt !== null) {
    kwargs["prompt"] = prompt;
  }

  console.log(requestResponse, 'asd')

  try {
    const requestInput = {
      "function_name": functionName,
      "args": [],
      "kwargs": kwargs,
      "tags": tags,
      "request_response": requestResponse,
      "request_start_time": Math.floor(requestStartTime / 1000),
      "request_end_time": Math.floor(requestEndTime / 1000),
      "api_key":PROMPTLAYER_API_KEY,
    };
    console.log('adsadads')
    const data = await fetch('https://api.promptlayer.com/track-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestInput),
    })
  } catch (e) {
    console.error('promptLayer error', e);
  }
}
