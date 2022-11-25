import AgoraRTC from 'agora-rtc-sdk-ng';

// AgoraRTC.setLogLevel(3)

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
    console.log('query', 'appId', appId, 'channelId', channelId, 'uid', uid)
    
    // Create local tracks
    const [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    
    // Play the local track
    if (display) localVideoTrack.play('localVideo');

    // Join a channnel and retrieve the uid for local user
    await client.join(appId, channelId, null, uid);
    await client.publish([localAudioTrack, localVideoTrack]);
};

// document.onload = ()=>init();
init()