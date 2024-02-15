import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/layout';
import Image from 'next/image';
import utilStyles from '../styles/utils.module.css';
import { useState, useEffect } from 'react'
import React, {Fragment} from 'react';

const editOptionData = {
  "background":{
    "blur":['exact', 'bounding box'], 
    "black out":['exact', 'bounding box']
  },
  "foreground": {
    "blur":['exact', 'bounding box'],
    "black out":['exact', 'bounding box'],
    "erase": ['exact']
  }
};

const foregroundOnly = ['2', '9', '10', '11']
const json = require('/public/image_json/image_data.json');

export default function PhotoPage1() {
    const image = '1';
    // const photoName = 'null';
    const photoName = 'Example Image';
    const originalWidth = json[image]['present']['dim'][0];
    const originalHeight = json[image]['present']['dim'][1]; 
    const newWidth = (350 * originalHeight/originalWidth > 500) ? 500 * originalWidth/originalHeight: 350;
    const newHeight = (350 * originalHeight/originalWidth > 500) ? 500: newWidth * originalHeight/originalWidth;

    const [privObj, setPrivObj] = useState([]);
    const [selectedObj, setSelectedObj] = useState('');
    const [borf, setBorf] = useState('')
    const [style, setStyle] = useState('');
    const [shape, setShape] = useState('');
    const [image_path, setImage_path] = useState("./images/" + image + "/" + image + ".jpeg");

    const [resultMessage, setResultMessage] = useState('')
    const [caption, setCaption] = useState(json[image]['present']['caption']);
    const [version, setVersion] = useState('present')
    const [overlay, setOverlay] = useState(<></>);  
    const [autoDim, setAutoDim] = useState({width: newWidth, height: newHeight})  
    const [applyMessage, setApplyMessage] = useState('Please select editing options.')
    const [applyDisabled, setApplyDisabled] = useState(true)
    const [submitMessage, setSubmitMessage] = useState('')

    
    // ===== image editor code begins ===== //
    

    const [explore, setExplore] = useState(false)

    useEffect(() => {
      setPrivObj(json[image]['present']['private_bboxes']); 
    }, []);

    const setBoundingBox = () => {
      let boxElements = [];
        
      json[image][version]['unique_bboxes'].forEach((box) => {
        let OCRText = "\n";
        json[image][version]['OCR'].forEach((OCRBox) => {
          let ocrC = OCRBox.boundingBox; // [x1,y1,x2,y2,x3,y3,x4,y4] where [top left, top right, bottom right, bottom left]
          let boxC = box.bbox; // [left, top, width, height]
            
          /* overlap detection:
            !(r2.left > r1.right ||
            r2.right < r1.left ||
            r2.top > r1.bottom ||
            r2.bottom < r1.top); let r2 be OCR, r1 be box
          */
          let intersecting = !(ocrC[0] > boxC[0]+boxC[2] || ocrC[4] < boxC[0] || ocrC[1] > boxC[1]+boxC[3] || ocrC[5] < boxC[1]);
          if (intersecting) OCRText += `text: "${OCRBox.content}"\n`;
        });

        let boxDiv = (
          <Image
            className='box'
            src="./images/transparent.png"
            width={box.bbox[2]* autoDim.width / originalWidth}
            height={box.bbox[3]* autoDim.height / originalHeight}
            style={{
              position: 'absolute',
              left: box.bbox[0]*autoDim.width / originalWidth,
              top: box.bbox[1]*autoDim.height / originalHeight,
              width: box.bbox[2]*autoDim.width / originalWidth,
              height: box.bbox[3]*autoDim.height / originalHeight
            }}
            title={box.caption + OCRText}
            ariaLabel={box.caption + OCRText}
          />);
        boxElements.push(boxDiv);
      });
      setOverlay(boxElements);
    }

    const handleObjChange = (event) => {
      setSelectedObj(event.target.value);
      setStyle('');
      if (event.target.value === "background") {
        setBorf('background')
      } else {
        setBorf('foreground')
      }
      setApplyMessage('Options invalid. Please select editing options.');
      setApplyDisabled(true)
    };

    const handleStyleChange = (event) => {
      setStyle(event.target.value);
      setShape('');
      setApplyMessage('Options invalid. Please select editing options.');
      setApplyDisabled(true)
    };

    const handleShapeChange = (event) => {
      setShape(event.target.value);
      if (editOptionData[borf][style].includes(event.target.value)) {
        setApplyDisabled(false);
        setApplyMessage('');
      } else {
        setApplyMessage('Options invalid. Please select editing options.');
        setApplyDisabled(true)
      }
      if (selectedObj === 'background') {
        if (foregroundOnly.includes(image)) {
          setApplyMessage('Cannot apply background removal. This photo does not have a focus, or the entire background is the focus.');
          setApplyDisabled(true)
        } 
      }
    };

    const handleApplyEdit = (event) => {
      let verName = ''
      if (selectedObj === 'background') {
        verName = "background_" + shape.replace(/ /g,"_") + "_" + style.replace(/ /g,"_") 
      } else {
        verName = selectedObj + "_foreground_" + shape.replace(/ /g,"_") + "_" + style.replace(/ /g,"_")
      }
      setResultMessage('Successfully applied edits!')
      setVersion(verName)
      setImage_path("./images/" + image + "/" + verName + '.jpeg')
      setCaption((json[image][verName]['caption'][selectedObj]) ? json[image][verName]['caption'][selectedObj] : json[image][verName]['caption'])
      setBoundingBox()
      // !! record result
    };

    const handleRevert = (event) => {
      setSelectedObj('')
      setStyle('')
      setShape('')
      setImage_path("./images/" + image + "/" + image + ".jpeg") 
      setVersion('present')
      setCaption(json[image]['present']['caption'])
      setResultMessage('')
      setApplyMessage('Cannot apply selected edits. Please re-select.');
    };

    const handleReviewImgError = (event) => {
      setResultMessage('Cannot apply the chosen edits.')
      setImage_path("./images/" + image + "/" + image + ".jpeg") 
      setVersion('present')
      setCaption(json[image]['present']['caption'])
      setApplyMessage('Cannot apply selected edits. Please re-select.');
    };

    const handleExplore = (event) => {
      let overviews = document.body.getElementsByClassName('overview');
      for (let overview of overviews) {
        overview.ariaHidden = true;
      }
      setBoundingBox();
      setExplore(true)
    };

    const handleExploreOff = (event) => {
      let overviews = document.body.getElementsByClassName('overview');
      for (let overview of overviews) {
        overview.ariaHidden = false;
      }
      setExplore(false)
    };

    const handleSubmit = (event) => {
      setSubmitMessage('Submitted.')
    }

    let styles = [];
    let shapes = [];
    if (borf === "background") {
      styles = Object.keys(editOptionData["background"]);
      shapes = style ? editOptionData["background"][style] : [];
    } 
    
    if (borf === "foreground") {
      styles = Object.keys(editOptionData["foreground"]);
      shapes = style ? editOptionData["foreground"][style] : [];
    }

    let exploreView = (<></>);
    if (explore) {
      exploreView = (
        <div className='overlay' aria-label='image explorer'>
        <br></br>
        <div className='relativewrapper'>
              <Image
              //   ref={refContainer} 
              //   onLoadingComplete={onLoadCallBack}
                src={image_path}
                width={newWidth}
                height={newHeight}
                id='image_explore'
                aria-hidden = {true}
              />
              {overlay}
            </div>
        <Fragment className={utilStyles.back}>
          <button onClick={handleExploreOff} aria-label="close explorer">Close Explorer</button>
        </Fragment>
        </div>
       );
    } else {
      exploreView = (<></>);
    }
 
    
    // ===== image editor code ends ===== //


    return  (
      <Layout>
        <Head>
          <title>Photo Page</title>
        </Head>
        <div className='overview'>
          <Fragment className={utilStyles.back}>
            <Link href="/" aria-label="back button">← Back</Link>
          </Fragment>

          <header className={utilStyles.header}>
          <h1 className={utilStyles.heading2Xl} aria-label={photoName}>{photoName}</h1>
          </header>

          <Fragment className={utilStyles.headingMd}>
            <h2 className={utilStyles.sectionHeading}>Explore Image</h2>
            <Fragment className='relativewrapper'>
              <Image
                src={image_path}
                width={300}
                height={originalHeight/originalWidth * 300}
                alt={caption}
                id='image_explore'
                onError={handleReviewImgError}
              />
            </Fragment>
            <button onClick={handleExplore}>Explore what's in the image through touch</button>
          </Fragment>

          {/* ===== image editor code begins ===== */} 
          <Fragment className={utilStyles.headingMd}>
            <h2 className={utilStyles.sectionHeading}>Edit Image</h2>
            
            Item: <select value={selectedObj} onChange={handleObjChange}>
              <option value="">Select a potential private item to hide</option>
              {privObj.map((item) =>( 
                <option key={item.id} value={item.id}>
                  {item.caption}
                </option>
              ))}
              <option value="background">Entire background</option>
            </select>
            <br></br>
            
            Style: <select value={style} onChange={handleStyleChange}>
              <option value="">Select the hidding style</option>
              {styles.map((style) =>(
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
            <br></br>
            
            Shape: <select value={shape} onChange={handleShapeChange}>
              <option value="">Select the shape to hide</option>
              {shapes.map((shape) =>(
                <option key={shape} value={shape}>
                {shape}
                </option>
              ))}
            </select>
            <br></br>
            <br></br>
            {applyMessage}
            <br></br>
            <button disabled={applyDisabled} onClick={handleApplyEdit}>Apply Edit</button>
            <p>{resultMessage}</p>
            <button onClick={handleRevert}>Revert</button>
          
          </Fragment>
          <br></br>      

          <Fragment>
          <button onClick={handleSubmit}>Complete and submit</button>
          {submitMessage}
          </Fragment>
        </div>

        {exploreView}

        {/* ===== image editor code ends ===== */} 
      </Layout>
    );
  }
