# Janus WebRTC React Native module

## usage

1. Follow the official instructions to install [React Native]:
    
    * Install Node 8.3 or newer

    * Run the command in a shell:

            $ npm install -g react-native-cli
        
    * Install Android Studio or Xcode for mobile application development

2. Clone this project. Install essential node modules with npm tool
        
            $ npm install

3. Connect your device to your computer. Build the app and install it on your mobile device.
The following code is for an android device.

            $ react-native start
            $ react-native run-android

4. Launch Janus server, backend server and Nginx server. (See [janus-demo-docker]) 

5. Open this app in your mobile device. Press the button to communicate with Janus server and backend server.

6. Check the log of your Docker server to see if connection is successful.
            
[React Native]: https://facebook.github.io/react-native/docs/getting-started

[janus-demo-docker]: https://git.gpac-licensing.com/yanhao/janus-demo-docker

## Extension

The `janus.js` and `App.js` are based on a [project] which is no longer maintained and cannot work due to
obsolete APIs. By updating the use of some APIs, this demo can work now but needs amending.

[project]: https://github.com/atyenoria/react-native-webrtc-janus-gateway