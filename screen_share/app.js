// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.


var localstream;
var pending_request_id = null;
var pc1,pc2;
var video = document.getElementById("video");
var self = document.getElementById("selfvid");  
//var pc_config = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};




window.addEventListener('message', function(event){
 if(event.origin!=window.location.origin){
    return;
 }
 if(event.data.type == 'gotScreen'){
   onAccessApproved(event.data.sourceId)
 }
 pending_request_id = event.data.request;

});


function gotRemoteStream(e){
  self.src = URL.createObjectURL(e.stream);
  console.log(e.stream);
  console.log("i am here at remote stream");
}



function gotOffer(desc){

  pc1.setLocalDescription(desc);
  pc2.setRemoteDescription(desc);
  pc2.onaddstream = gotRemoteStream;
  pc2.createAnswer(gotRemoteDescription);


  console.log(desc.sdp);

} 

function gotRemoteDescription(desc){
  pc2.setLocalDescription(desc);
  pc1.setRemoteDescription(desc);
}

function errorOffer(err){
  console.log(err);
}



function getScreenMessage(){
  window.postMessage({type: 'getScreen', id: 'pending'},'*')
}

function cancelScreenMessage(){
   console.log("this is the requ"+pending_request_id);

  window.postMessage({type: 'cancelGetScreen', request: pending_request_id }, '*')
}

function gotStream(stream) {
  console.log("Received local stream");
 
  video.src = URL.createObjectURL(stream);
  localstream = stream;


  stream.onended = function() { console.log("Ended"); };
}


function callthescreen(){
  pc1 = new webkitRTCPeerConnection(null);

  pc1.onicecandidate = gotLocalIceCandidate;
  
  pc2 = new webkitRTCPeerConnection(null);

  pc2.onicecandidate = gotRemoteIceCandidate;

  pc2.onaddStream = gotRemoteStream;

  pc1.addStream(localstream);

  pc1.createOffer(gotOffer);

}

function hangupscreen(){
  pc1.close();
  pc2.close();
  pc1 = null; 
  pc2 = null;
  video.src = "";

}

function gotLocalIceCandidate(event){
  if(event.candidate){
    pc2.addIceCandidate(new RTCIceCandidate(event.candidate))
  }
}

function gotRemoteIceCandidate(){
  if(event.candidate){
    pc1.addIceCandidate(new RTCIceCandidate(event.candidate));
  }
}


function getUserMediaError() {
  console.log("getUserMedia() failed.");
}

function onAccessApproved(id) {


  if (!id) {
    console.log("Access rejected.");
    return;
  }
  navigator.webkitGetUserMedia({
      audio:false,
      video: { mandatory: { chromeMediaSource: "desktop", chromeMediaSourceId: id} }
  }, gotStream, getUserMediaError);
}

var start = document.getElementById('start').addEventListener('click', getScreenMessage);

var call = document.getElementById('call').addEventListener('click', callthescreen);

var hangup = document.getElementById('hangup').addEventListener('click',hangupscreen);






