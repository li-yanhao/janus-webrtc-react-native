/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, Component } from 'react';
import {
  TouchableHighlight, TouchableOpacity, TouchableWithoutFeedback,
  Alert, Button,
  StyleSheet,
  View,
  Text,

} from 'react-native';


import { Janus } from './janus.js';

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices
} from 'react-native-webrtc';

import { Dimensions } from 'react-native';


// also support setRemoteDescription, createAnswer, addIceCandidate, onnegotiationneeded, oniceconnectionstatechange, onsignalingstatechange, onaddstream

const dimensions = Dimensions.get('window')

const configuration = { "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] };
const pc = new RTCPeerConnection(configuration);
let isFront = false;

//export default 
class App extends React.Component {



  constructor(props) {
    super(props);

    this.state = { streamUrl: null };
  };


  componentDidMount() {
    console.log('componentDidMount');

    mediaDevices.enumerateDevices().then(sourceInfos => {
      console.log(sourceInfos);
      let videoSourceId;
      for (let i = 0; i < sourceInfos.length; i++) {
        const sourceInfo = sourceInfos[i];
        if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "back")) {
          videoSourceId = sourceInfo.deviceId;
        }
      }

      mediaDevices.getUserMedia({
        audio: true,
        video: {
          mandatory: {
            minWidth: 500, // Provide your own width, height and frame rate here
            minHeight: 1200,
            minFrameRate: 60
          },
          facingMode: (isFront ? "user" : "environment"),
          optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
        }
      }).then(stream => {
        // Got stream!
        // this.state.stream = stream;
        this.setState(previousState => (
          { streamUrl: stream.toURL() }
        ))
        console.log("Got stream !")
        console.log("Stream ID: " + this.state.streamUrl)
      }).catch(error => {
        // Log error
      });
    });
  }







  render() {
    return (
      <View>
        {<RTCView streamURL={this.state.streamUrl} style={{ width: 350, height: 600 }} />}
      </View>
    );
  }

}



pc.createOffer().then(desc => {
  pc.setLocalDescription(desc).then(() => {
    // Send pc.localDescription to peer
  });
});

pc.onicecandidate = function (event) {
  // send event.candidate to peer
};

var sfutest = null;
let host = "10.1.7.19"
let server = "http://" + host + ":8088/janus"
let backHost = "http://" + host + ":3000/stream"
let pin = null;
let myroom = null;
let myid = null;
let janus = null;


Janus.init({
  debug: "all", callback: function () {
    if (started)
      return;
    started = true;
  }
});

export default class JanusReactNative extends Component {

  constructor(props) {
    super(props);
    this.state = {
      info: 'Initializing',
      status: 'init',
      roomID: '',
      isFront: true,
      selfViewSrc: null,
      selfViewSrcKey: null,
      remoteList: {},
      remoteListPluginHandle: {},
      textRoomConnected: false,
      textRoomData: [],
      textRoomValue: '',
      publish: false,
      speaker: false,
      audioMute: false,
      videoMute: false,
      visible: false,
      buttonText: "Start for Janus !!!"
    };
    this.janusStart.bind(this);
    this.onPressButton.bind(this);
  }



  componentDidMount() {
  }

  janusStart = () => {
    this.setState({ visible: true });
    janus = new Janus(
      {
        server: server,
        success: () => {
          janus.attach(
            {
              plugin: "janus.plugin.videoroom",
              success: (pluginHandle) => {
                sfutest = pluginHandle;
                this.requestStart().then(this.registerUsername);
                // let register = { "request": "join", "room": 1234, "ptype": "publisher", "display": "yanhao", "id": 5035925950 };
                // sfutest.send({ "message": register });
              },
              error: (error) => {
                Alert.alert("  -- Error attaching plugin...", error);
              },
              consentDialog: (on) => {
              },
              mediaState: (medium, on) => {
              },
              webrtcState: (on) => {
              },
              onmessage: (msg, jsep) => {
                var event = msg["videoroom"];
                if (event != undefined && event != null) {
                  if (event === "joined") {
                    myid = msg["id"];
                    this.publishOwnFeed(true);
                    this.setState({ visible: false });
                    if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                      var list = msg["publishers"];
                      for (var f in list) {
                        var id = list[f]["id"];
                        var display = list[f]["display"];
                        // this.newRemoteFeed(id, display)
                      }
                    }
                  } else if (event === "destroyed") {
                  } else if (event === "event") {
                    if (msg["publishers"] !== undefined && msg["publishers"] !== null) {
                      var list = msg["publishers"];
                      for (var f in list) {
                        let id = list[f]["id"]
                        let display = list[f]["display"]
                        // this.newRemoteFeed(id, display)
                      }
                    } else if (msg["leaving"] !== undefined && msg["leaving"] !== null) {
                      var leaving = msg["leaving"];
                      var remoteFeed = null;
                      let numLeaving = parseInt(msg["leaving"])
                      if (this.state.remoteList.hasOwnProperty(numLeaving)) {
                        delete this.state.remoteList.numLeaving
                        this.setState({ remoteList: this.state.remoteList })
                        this.state.remoteListPluginHandle[numLeaving].detach();
                        delete this.state.remoteListPluginHandle.numLeaving
                      }
                    } else if (msg["unpublished"] !== undefined && msg["unpublished"] !== null) {
                      var unpublished = msg["unpublished"];
                      if (unpublished === 'ok') {
                        sfutest.hangup();
                        return;
                      }
                      let numLeaving = parseInt(msg["unpublished"])
                      if ('numLeaving' in this.state.remoteList) {
                        delete this.state.remoteList.numLeaving
                        this.setState({ remoteList: this.state.remoteList })
                        this.state.remoteListPluginHandle[numLeaving].detach();
                        delete this.state.remoteListPluginHandle.numLeaving
                      }
                    } else if (msg["error"] !== undefined && msg["error"] !== null) {
                    }
                  }
                }
                if (jsep !== undefined && jsep !== null) {
                  sfutest.handleRemoteJsep({ jsep: jsep });
                }
              },
              onlocalstream: (stream) => {
                this.setState({ selfViewSrc: stream.toURL() });
                this.setState({ selfViewSrcKey: Math.floor(Math.random() * 1000) });
                this.setState({ status: 'ready', info: 'Please enter or create room ID' });
              },
              onremotestream: (stream) => {
              },
              oncleanup: () => {
                mystream = null;
              }
            });
        },
        error: (error) => {
          Alert.alert("  Janus Error", error);
        },
        destroyed: () => {
          // Alert.alert("  Success for End Call ");
          this.setState({ publish: false });
        }
      })
  }

  async registerUsername() {
    console.log("register user name")
    var username = 'yanhao';

    var register = { "request": "join", "room": myroom, "ptype": "publisher", "display": username, "pin": pin, id: myid };
    sfutest.send({ "message": register });
    var bitrate = 2000 * 1024;
    sfutest.send({ "message": { "request": "configure", "bitrate": bitrate } });
  }

  publishOwnFeed(useAudio) {
    if (!this.state.publish) {
      this.setState({ publish: true, buttonText: "Stop"});

      sfutest.createOffer(
        {
          media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },
          success: (jsep) => {
            console.log("Create offer : success \n")
            var publish = { "request": "configure", "audio": useAudio, "video": true, "bitrate": 5000 * 1024 };
            sfutest.send({ "message": publish, "jsep": jsep });
          },
          error: (error) => {
            Alert.alert("WebRTC error:", error);
            if (useAudio) {
              publishOwnFeed(false);
            } else {
              
            }
          }
        });
    } else {
      // this.setState({ publish: false });
      // let unpublish = { "request": "unpublish" };
      // sfutest.send({"message": unpublish});
    }
  }

  async requestStart() {
    await fetch(backHost, {
      cache: "no-cache",
      credentials: "omit",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: JSON.stringify({
        login: "yanhao",
        passwd: "1234",
        roomid: 5555,
        request: 'publish'
      })
    }).then(response => {
      return response.json()
    }).then(data => {
      console.log("parse response")
      console.log(data)
      if (data.status === "success") {
        myroom = data.key.room
        pin = data.key.pin
        myid = data.key.id
      }
    })
  }

  unpublishOwnFeed(){
    if (this.state.publish){
      this.setState({buttonText: "Start for Janus !!!"});
      let unpublish = {request: "unpublish"};
      sfutest.send({message: unpublish});
      janus.destroy();
      this.setState({ selfViewSrc: null });
    } 
  }

  onPressButton = () => {
    if (!this.state.publish){
      this.janusStart();
    }
    else {
      this.unpublishOwnFeed();
    }
  }


  render() {
    return (
      <View style={styles.container}>

        <TouchableWithoutFeedback
          onPress={this.onPressButton}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>{this.state.buttonText}</Text>
          </View>
        </TouchableWithoutFeedback>
        {this.state.selfViewSrc &&
          <RTCView key={this.state.selfViewSrcKey}
            streamURL={this.state.selfViewSrc}
            style={{ width: 350, height: 600 }} />}

      </View>


    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    alignItems: 'center'
  },
  button: {
    marginBottom: 30,
    width: 260,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    padding: 20,
    color: 'white'
  }
});



// skip this line if using Create React Native App
// AppRegistry.registerComponent('AwesomeProject', () => ButtonBasics);
