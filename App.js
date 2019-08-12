/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Fragment, Component } from 'react';
import {
  Platform, TouchableHighlight, TouchableOpacity, TouchableNativeFeedback, TouchableWithoutFeedback,
  FlatList, ActivityIndicator,
  Alert, Button,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  AppRegistry,
  Image
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { Janus } from './janus.js';

// const App = () => {
//   return (
//     <Fragment>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView>
//         <ScrollView
//           contentInsetAdjustmentBehavior="automatic"
//           style={styles.scrollView}>
//           <Header />
//           {global.HermesInternal == null ? null : (
//             <View style={styles.engine}>
//               <Text style={styles.footer}>Engine: Hermes</Text>
//             </View>
//           )}
//           <View style={styles.body}>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Step One</Text>
//               <Text style={styles.sectionDescription}>
//                 Edit <Text style={styles.highlight}>App.js</Text> to change this
//                 screen and then come back to see your edits.
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>See Your Changes</Text>
//               <Text style={styles.sectionDescription}>
//                 <ReloadInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Debug</Text>
//               <Text style={styles.sectionDescription}>
//                 <DebugInstructions />
//               </Text>
//             </View>
//             <View style={styles.sectionContainer}>
//               <Text style={styles.sectionTitle}>Learn More</Text>
//               <Text style={styles.sectionDescription}>
//                 Read the docs to discover what to do next:
//               </Text>
//             </View>
//             <LearnMoreLinks />
//           </View>
//         </ScrollView>
//       </SafeAreaView>
//     </Fragment>
//   );
// };

// const styles = StyleSheet.create({
//   scrollView: {
//     backgroundColor: Colors.lighter,
//   },
//   engine: {
//     position: 'absolute',
//     right: 0,
//   },
//   body: {
//     backgroundColor: Colors.white,
//   },
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: Colors.black,
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//     color: Colors.dark,
//   },
//   highlight: {
//     fontWeight: '700',
//   },
//   footer: {
//     color: Colors.dark,
//     fontSize: 12,
//     fontWeight: '600',
//     padding: 4,
//     paddingRight: 12,
//     textAlign: 'right',
//   },
// });

// export default App;

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
let myusername = Math.floor(Math.random() * 1000);
let roomId = 1234
let myid = null;
let mystream = null;

Janus.init({debug: "all", callback: function() {
  if(started)
      return;
  started = true;
}});

export default class Touchables extends Component {

  constructor(props) {
    super(props);
    this.state ={ 
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
      visible: false
    };
    this._onfetchJson = this._onfetchJson.bind(this);
    this.janusStart.bind(this)
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
                let register = { "request": "join", "room": roomId, "ptype": "publisher", "display": myusername.toString() };
                sfutest.send({ "message": register });
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
          Alert.alert("  Success for End Call ");
          this.setState({ publish: false });
        }
      })
  }

  publishOwnFeed(useAudio) {
    if (!this.state.publish) {
      this.setState({ publish: true });
      
      sfutest.createOffer(
        {
          media: { audioRecv: false, videoRecv: false, audioSend: useAudio, videoSend: true },
          success: (jsep) => {
            console.log("Create offer : success \n")
            var publish = { "request": "configure", "audio": useAudio, "video": true, "bitrate": 5000*1024 };
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

  

  _onfetchJson() {
    console.log("try to fetch");
    fetch("http://" + host + ":3000/", {
      cache: "no-cache",
      credentials: "omit",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      method: "POST",
      body: null
    }).then(response => {
      return response.json()
    }).then(data => {
      console.log(data)
      let mes = data.message;
      Alert.alert(mes);
      this.setState(previousState => (
        { message: data.message }
      ))

    })

    /*.then(res => {
      console.log("get a response:");
      console.log(res)
      Alert.alert(res.data);
    })*/
  }


  render() {
    return (
      <View style={styles.container}>
       
        <TouchableWithoutFeedback
          onPress={this.janusStart}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Start for Janus!!!</Text>
          </View>
        </TouchableWithoutFeedback>
        { this.state.selfViewSrc && 
        <RTCView key={this.state.selfViewSrcKey} 
        streamURL={this.state.selfViewSrc} 
        style={{ width: 350, height: 600 }}/>}
        
        <View style={{ flex: 1, paddingTop: 20 }}>
          <Text style={styles.baseText}>{this.state.selfViewSrc + " " + this.state.selfViewSrcKey}</Text>
        </View>
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
