import AgoraRTC, { ILocalAudioTrack } from 'agora-rtc-sdk-ng';

AgoraRTC.setLogLevel(3)

const logVolume = (channelId: string, track: ILocalAudioTrack, volumelevel: number) => {
  setInterval(() => {
    let volume = track.getVolumeLevel();
    if (volume > volumelevel) {
      console.log(
        `${channelId} is playing at ${volume}`,
        new Date().getTime(),
        track.getStats()
      );
    }
  }, 200);
};

async function init () {
    // Client Setup
    console.log('init')
    // Defines a client for RTC
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const query = new URLSearchParams(window.location.search);
    // Get credentials from the form
    let appId = query.get('appid')!;
    let channelId = query.get('channel')!;
    let uid = parseInt(query.get('uid')!);
    let display = query.get('display') || false;
    let volumelevel = query.get("volumelevel") ? parseFloat(query.get("volumelevel")!) : 0.5;
    console.log('query', 'appId', appId, 'channelId', channelId, 'uid', uid)
    console.time(`ch: ${channelId} duration`)
    // Create local tracks
    const [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    logVolume(channelId, localAudioTrack, volumelevel)
    // Play the local track
    if (display) localVideoTrack.play('localVideo');

    // Join a channnel and retrieve the uid for local user
    await client.join(appId, channelId, null, uid);
    await client.publish([localAudioTrack, localVideoTrack]);
    // console.log(new Date())
    // console.log("Channel:", channelId);
    console.log("ch:", channelId,  new Date().getTime(), );
    console.timeEnd(`ch: ${channelId} duration`);
};

// document.onload = ()=>init();
init()