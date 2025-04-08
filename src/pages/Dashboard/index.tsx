import React, { Component, ChangeEvent, KeyboardEvent } from 'react';

import { Form } from 'react-bootstrap';
import ROSLIB from 'roslib';

import logo from './image/logo.png';
import wifi_white from './image/wifi_white.png';
import settings from './image/setting.png';
import joy from './image/joy.png';
import connect from './image/connect.png';
import connectionLost from './image/connection_lost.jpg';

import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import configs from '../../configs';
import { initROSMasterURI } from '../../components/ROS/Connector/ROSConnector';
import ImageViewer from '../../components/ROS/ImageViewer';
import GamepadComponent from '../../components/GamepadAPI';

import testImg from '../../components/ROS/ImageViewer/resources/connection_lost.jpg'

import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import FlipperVisualization from '../../components/FlipperVisualization';


interface IProps {}
interface IState {
  Button_A_Flag: boolean;
  A_Value: number;
  B_value: number;
  C_value: number;
  D_value: number;
  E_value: number;
  F_value: number;

  A_ROS_Value: number;
  B_ROS_Value: number;
  readROSInt16: number;
  ros: ROSLIB.Ros;
  didMounted: boolean;
}

const initialROS = (url: string) => {
  const ros = new ROSLIB.Ros({ url });
  return ros;
};

class App extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      readROSInt16: 0,
      ros: initialROS('ws://10.42.2.111:9090'),
      Button_A_Flag: false,
      A_Value: 0,
      B_value: 0,
      C_value: 0,
      D_value: 0,
      E_value: 0,
      F_value: 0,
      A_ROS_Value: 0,
      B_ROS_Value: 0,
      didMounted: false,
    };
  }

  handleInputCChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.SubscribeInt16(this.state.ros, '/motor_jetson')
  };

  onButtonAClickHandle = () => {
    this.setState({
      Button_A_Flag: !this.state.Button_A_Flag
    });

    const { ros } = this.state;
    this.PublishInt16(ros, "/gui/buttonCommand", this.state.A_Value)
    console.log("onButtonClickHandle : ", this.state.Button_A_Flag)
  }

  onButtonBClickHandle = () => {
    // Add button B logic here if needed
  }

  SubscribeInt16 = (ros: ROSLIB.Ros, topicName: string) => {
    const robotReadTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName,
      messageType: 'std_msgs/Int16',
    });

    robotReadTopic.subscribe((message: ROSLIB.Message) => {
      const messageResponse = message as ROSLIB.Message & {
        data: number,
      };

      if (topicName === '/Tweezers_jetson') {
        this.setState({ A_Value: messageResponse.data });
      } else if (topicName === '/motor_jetson') {
        this.setState({ C_value: messageResponse.data });
      } else if (topicName === '/servo2_jetson') {
        this.setState({ D_value: messageResponse.data });
      } else if (topicName === '/servo1_jetson') {
        this.setState({ E_value: messageResponse.data });
      } else if (topicName === '/motor2_jetson') {
        this.setState({ F_value: messageResponse.data });
      }
    });
  }

  PublishInt16 = (ros: ROSLIB.Ros, topicName: string, value: number) => {
    const joypadRosTopic = new ROSLIB.Topic({
      ros: ros,
      name: topicName, // Adjust the topic name based on your setup, e.g., '/your_joy_topic'
      messageType: 'std_msgs/Int16', // Adjust the message type based on your setup
    });

    const Int16Message = new ROSLIB.Message({
      data: value,
    });

    joypadRosTopic.publish(Int16Message)
  }

  onROSConnection = () => {
    console.log("connected !")
    this.SubscribeInt16(this.state.ros, '/Tweezers_jetson')
    this.SubscribeInt16(this.state.ros, '/motor_jetson')
    this.SubscribeInt16(this.state.ros, '/servo2_jetson')
    this.SubscribeInt16(this.state.ros, '/servo1_jetson')
    this.SubscribeInt16(this.state.ros, '/motor2_jetson')
  }

  onROSError = () => {
    console.log("error")
  }

  onROSClose = () => {
    console.log("closed")
  }

  componentDidMount = () => {
    const { ros } = this.state;
    ros.on('connection', this.onROSConnection)
    ros.on('error', this.onROSError)
    ros.on('close', this.onROSClose)
  }

  componentWillUnmount = () => {
    if (this.state.didMounted) {
      this.state.ros.close()
    }
  }

  handleInputBChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isNaN(Number(event.target.value))) {
      this.setState({
        B_value: Number(event.target.value)
      })
    }
  }

  handleInputBKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const { ros } = this.state;
      this.PublishInt16(ros, "/right_servo_cmd", this.state.B_value)
      console.log("ROS_B", this.state.B_value)
    }
  };

  render() {
    return (
      <Container fluid className="App">
        {/* Camera Views */}
        <Row className="mb-4 justify-content-center">
        <Col xs={12} md={4} className="d-flex justify-content-center">
            <div className="camera-view">
              <ImageViewer
                ros={this.state.ros}
                ImageCompressedTopic={'/camera2/image_raw/compressed'}
                width={''}
                height={''}
                rotate={180}
                hidden={false}
              />
              <label>Rotate Camera:</label>
              <h6 >rosrun usb_cam usb_cam_node _video_device:=/dev/video0 _framerate:=30 เปิดกล้องjetson</h6>
            </div>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-center">
            <div className="camera-view">
              <ImageViewer
                ros={this.state.ros}
                ImageCompressedTopic={'/camera2/image_raw/compressed'}
                width={''}
                height={''}
                rotate={0}
                hidden={false}
              />
              <label>Front Camera:</label>
              <h6 >rosrun usb_cam usb_cam_node _video_device:=/dev/video0 _framerate:=30 เปิดกล้องjetson</h6>
            </div>
          </Col>
          <Col xs={12} md={4} className="d-flex justify-content-center">
            <div className="camera-view">
              <ImageViewer
                ros={this.state.ros}
                ImageCompressedTopic={'/usb_cam/image_raw/compressed'}
                width={''}
                height={''}
                rotate={0}
                hidden={false}
              />
              <label>Rotate Camera:</label>
              <h6 >rosrun usb_cam usb_cam_node _video_device:=/dev/video0 _framerate:=30 เปิดกล้องjetson</h6>
            </div>
          </Col>
        </Row>
     

                {/* Work Section */}
                <Row className="mb-4 justify-content-center">
          <Col xs={12} md={6} className="d-flex justify-content-center">
            <Button
              onClick={this.onButtonAClickHandle}
              variant={!this.state.Button_A_Flag ? 'primary' : 'warning'}
              className="start-button"
            >
              Start
            </Button>
          </Col>
        </Row>

        <Row className="mb-4 justify-content-center">
          <Col xs={12} md={6} className="d-flex justify-content-center">
          <div className="gripper-section w-100">
            <h4>Move</h4>
              <Form.Group controlId="walk">
                <label>Walk:</label>
                <input type="text" value={this.state.C_value} readOnly className="form-control" />
              </Form.Group>
              <Form.Group controlId="turn">
                <label>Turn:</label>
                <input type="text" value={this.state.F_value} readOnly className="form-control" />
              </Form.Group>
            </div>
          </Col>
        </Row>
                {/* Gripper Section */}
        <Row className="justify-content-center">
          <Col xs={12} md={6} className="d-flex justify-content-center">
            <div className="gripper-section w-100">
              <h4>Gripper</h4>
              <Form.Group controlId="tweezers">
                <label>Tweezers:</label>
                <input type="text" value={this.state.A_Value} readOnly className="form-control" />
              </Form.Group>
              <Form.Group controlId="arm1">
                <label>Arm 1:</label>
                <input type="text" value={this.state.E_value} readOnly className="form-control" />
              </Form.Group>
              <Form.Group controlId="arm2">
                <label>Arm 2:</label>
                <input type="text" value={this.state.D_value} readOnly className="form-control" />
              </Form.Group>
            </div>
          </Col>
        </Row>

        {/* Gamepad Section */}
        <Row className="mb-4 justify-content-center">
          <Col xs={12} md={6} className="d-flex justify-content-center">
            <GamepadComponent 
              ros={this.state.ros} 
              joypadTopicName={'/gui/output/robot_control'} 
              onJoyStickConnection={(connection) => {
                // You can handle joystick connection logic here if needed
                console.log('Gamepad connection status:', connection);
              }} 
              joyEnable={this.state.Button_A_Flag} 
            />
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;