import AgoraRTC, { IAgoraRTCClient, ILocalAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

let remoteContainer= document.getElementById("remote-container")!;

/**
 * @name addVideoContainer
 * @param uid - uid of the user
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoContainer(uid: string){
    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=uid;                       // Assigning id to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container
}
/**
 * @name removeVideoContainer
 * @param uid - uid of the user
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoContainer(uid: string){
    let remDiv=document.getElementById(uid);
    remDiv && remDiv.parentNode?.removeChild(remDiv);
}



document.getElementById("start")!.onclick = async function () {
    // Client Setup
    // Defines a client for RTC
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const query = new URLSearchParams(window.location.search);

    // Get credentials from the form
    let appId = query.get('appId')!;
    let channelId = query.get('channel')!;
    let uid = query.get('uid')!;

    // Create local tracks
    const [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
    
    // Initialize the stop button
    initStop(client, localAudioTrack, localVideoTrack);
    
    // Play the local track
    localVideoTrack.play('me');

    // Set up event listeners for remote users publishing or unpublishing tracks
    client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType); // subscribe when a user publishes
        if (mediaType === "video") {
          addVideoContainer(String(user.uid)) // uses helper method to add a container for the videoTrack
          user.videoTrack?.play(String(user.uid));
        }
        if (mediaType === "audio") {
          user.audioTrack?.play(); // audio does not need a DOM element
        }
    });
    client.on("user-unpublished",  async (user, mediaType) => {
        if (mediaType === "video") {
            removeVideoContainer(String(user.uid)) // removes the injected container
        }
    });

    // Join a channnel and retrieve the uid for local user
    await client.join(appId, channelId, null, uid);
    await client.publish([localAudioTrack, localVideoTrack]);
};

function initStop(client: IAgoraRTCClient, localAudioTrack: ILocalAudioTrack, localVideoTrack: ILocalVideoTrack){
    const stopBtn = document.getElementById('stop') as HTMLButtonElement;
    stopBtn.disabled = false; // Enable the stop button
    stopBtn.onclick = null; // Remove any previous event listener
    stopBtn.onclick = function () {
        client.unpublish(); // stops sending audio & video to agora
        localVideoTrack.stop(); // stops video track and removes the player from DOM
        localVideoTrack.close(); // Releases the resource
        localAudioTrack.stop();  // stops audio track
        localAudioTrack.close(); // Releases the resource
        client.remoteUsers.forEach(user => {
            if (user.hasVideo) {
                removeVideoContainer(String(user.uid)) // Clean up DOM
            }
            client.unsubscribe(user); // unsubscribe from the user
        });
        client.removeAllListeners(); // Clean up the client object to avoid memory leaks
        stopBtn.disabled = true;
    }
}