/**
 * Encodes raw audio bytes into a Base64 string.
 * This is typically used to prepare audio data to be sent to an API.
 * @param bytes The raw audio data as a Uint8Array.
 * @returns A Base64 encoded string.
 */
export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string into raw audio bytes (Uint8Array).
 * This is used to process audio data received from an API.
 * @param base64 The Base64 encoded audio string.
 * @returns A Uint8Array of the raw audio data.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}


/**
 * Decodes raw PCM audio data into an AudioBuffer for playback in the browser.
 * The Web Audio API's native `decodeAudioData` is for file formats (like .wav, .mp3)
 * and will not work on raw PCM streams. This function manually constructs the AudioBuffer.
 * @param data The raw PCM audio data as a Uint8Array.
 * @param ctx The AudioContext to use for creating the buffer.
 * @param sampleRate The sample rate of the audio (e.g., 16000, 24000).
 * @param numChannels The number of audio channels (e.g., 1 for mono).
 * @returns A Promise that resolves to an AudioBuffer.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // The raw data is likely 16-bit signed integers.
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize the 16-bit integer to a float between -1.0 and 1.0
      channelData[i] = dataInt16[i * numChannels + channel]! / 32768.0;
    }
  }
  return buffer;
}
