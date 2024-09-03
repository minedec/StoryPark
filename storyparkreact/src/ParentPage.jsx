import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { generateImage, generateOutline, splitStory, extractBackground, extractCharacter } from './util';
import { extractBackgroundPrompt, scensUrl, characterPrompt, splitStoryText, backgroundImages, scenesPromptGlobal } from './App.js'

const ParentPage = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [storyText, setStoryText] = useState('');
  const [stage, setStage] = useState(1);
  const [lessonText, setLessonText] = useState('');
  const [splitStoryJson, setSplitStoryJson] = useState();
  const [outline, setOutline] = useState('');
  const navigate = useNavigate();

  // 新增的状态变量
  const [scenes, setScenes] = useState([
    '1-0.png',
    '1-1.png',
    '1-2.png',
    '1-3.png'
  ]);
  const [elements, setElements] = useState([
    { name: 'Scroll 1', src: 'story1.png' },
    { name: 'Scroll 2', src: 'story2.png' },
    { name: 'Scroll 3', src: 'story3.png' }
  ]);
  const [loadingStates, setLoadingStates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const narrativeSkills = [
    '角色塑造', '情节构建', '场景描述', '对话创作', '情感表达'
  ];

  const keywords = [
    '兔子', '雪人', '猴子', '小鸟', '变形金刚'
  ];

  const [scenesPrompt, setScenesPrompt] = useState([
    'a',
    'b',
    'c',
    'd'
  ]);

  extractBackgroundPrompt._extractBackgroundPrompt = [];
  characterPrompt._characterPrompt = [];
  scensUrl._scensUrl = [
    '1-0.png',
    '1-1.png',
    '1-2.png',
    '1-3.png'
  ]

  const handleSkillChange = (skill) => {
    setSelectedSkills(prevSkills =>
      prevSkills.includes(skill)
        ? prevSkills.filter(s => s !== skill)
        : [...prevSkills, skill]
    );
  };

  const handleKeywordChange = (keyword) => {
    setSelectedKeywords(prevKeywords =>
      prevKeywords.includes(keyword)
        ? prevKeywords.filter(k => k !== keyword)
        : [...prevKeywords, keyword]
    );
  };

  const handleGenerate = async () => {
    if (selectedSkills.length > 0) {
      console.log(selectedSkills);
      console.log(selectedKeywords);
      setStoryText('');
      var target = selectedSkills[0];
      var keywords = "";
      for (var keyword of selectedKeywords) {
        keywords += keyword + ',';
      }
      var data = await generateOutline(lessonText, keywords, target);
      setOutline(data);
      setStoryText(data);
      // split story
      var text = data;
      text += '\n------------------------';
      data = await splitStory(data);
      text += '\nPart1:' + data.part1;
      text += '\nPart2:' + data.part2;
      text += '\nPart3:' + data.part3;
      text += '\nPart4:' + data.part4;
      setStoryText(text);
      setSplitStoryJson(data);
      splitStoryText._splitStoryText = data;
    } else {
      alert('请至少选择一个叙事能力');
    }
  };

  const handleNextStage = async () => {
    if (stage === 1) {
      setStoryText(lessonText);
      console.log("获取初始文本：\n" + lessonText)
    } else if (stage === 2) {
      setIsGenerating(true);
      setIsLoading(true);
      await handleInitImage();
      await handleInitElement();
      setIsLoading(false);
      setIsGenerating(false);
    }
    setStage(prevStage => prevStage + 1);
  };

  const handlePreviousStage = () => {
    setStage(prevStage => prevStage - 1);
  };

  const handleNextStep = () => {
    // 最后一步，跳转到StoryPage
    window.StoryState.storyIndex = 1;
    window.StoryState.chapterIndex = 0;
    // store elements' src
    window.StoryState.elementSrcs = elements.map(element => element.src);
    navigate('/StoryPage');
  };

  const handleStoryTextChange = (event) => {
    setStoryText(event.target.value);
  };

  const handleLessonTextChange = (event) => {
    setLessonText(event.target.value);
  };

  const handleAdaptStory = async () => {
    setIsGenerating(true);
    await handleGenerate();
    setIsGenerating(false);
  };

  const handleInitImage = async () => {
    if(splitStoryJson === undefined || splitStoryJson === null) return;
    console.log("extract image prompt");
    const ch1 = await extractBackground(splitStoryJson.part1);
    const ch2 = await extractBackground(splitStoryJson.part2);
    const ch3 = await extractBackground(splitStoryJson.part3);
    const ch4 = await extractBackground(splitStoryJson.part4);
    console.log("extract:\n1:" + ch1 + "\n2:" + ch2 + "\n3:" + ch3 + "\n4:" + ch4);
    const bgPrompt = [ch1, ch2, ch3, ch4];
    extractBackgroundPrompt._extractBackgroundPrompt = [];
    extractBackgroundPrompt._extractBackgroundPrompt.push(ch1);
    extractBackgroundPrompt._extractBackgroundPrompt.push(ch2);
    extractBackgroundPrompt._extractBackgroundPrompt.push(ch3);
    extractBackgroundPrompt._extractBackgroundPrompt.push(ch4);

    const newScenesPrompt = [...scenesPrompt];
    newScenesPrompt[0] = ch1;
    newScenesPrompt[1] = ch2;
    newScenesPrompt[2] = ch3;
    newScenesPrompt[3] = ch4;
    setScenesPrompt(newScenesPrompt);

    const newScenes = [...scenes];
    for(let i = 0; i < 4; i++) {
      console.log(extractBackgroundPrompt._extractBackgroundPrompt[i]);
      const response = await generateImage(`Generate a scene for ${bgPrompt[i]}`);
      scensUrl._scensUrl[i] = response.image_url
      newScenes[i] = response.image_url;
    }
    setScenes(newScenes);
  }

  useEffect(() => {
    scenesPromptGlobal.splice(0, scenesPromptGlobal.length, ...scenesPrompt);
    console.log("gloabl scenes prompt"+ scenesPromptGlobal);
  }, [scenesPrompt]);

  useEffect(() => {
    console.log('scenes changed');
    console.log(scenes);
    // Update the global backgroundImages variable
    backgroundImages.splice(0, backgroundImages.length, ...scenes);
  }, [scenes]);

  const handleInitElement = async () => {
    console.log("extract character prompt");
    const character = await extractCharacter(outline);
    console.log("extract:\n" + character);
    const characters = character.split('|');
    characterPrompt._characterPrompt = [];
    
    const newElements = [...elements];
    for(let i = 0; i < characters.length; i++) {
      characterPrompt._characterPrompt.push(characters[i]);
      const response = await generateImage(`Generate an element for ${characters[i]}`);
      newElements[i] = { name: characters[i], src: response.image_url };
    }
    setElements(newElements);
  }

  const handleImageClick = async (index, type) => {
    setLoadingStates(prev => ({ ...prev, [`${type}-${index}`]: true }));

    try {
      if (type === 'scene') {
        const newScenes = [...scenes];
        const response = await generateImage(`Generate a scene for ${scenesPromptGlobal[index]}`);
        newScenes[index] = response.image_url;
        scensUrl._scensUrl[index] = response.image_url;
        setScenes(newScenes);
      } else if (type === 'element') {
        const newElements = [...elements];
        const response = await generateImage(`Generate an element for ${newElements[index].name}`);
        newElements[index] = { ...newElements[index], src: response.image_url };
        setElements(newElements);
      }
    } catch (error) {
      console.error('Error generating image:', error);
      if (type === 'scene') {
        const newScenes = [...scenes];
        newScenes[index] = 'error-generating-image.png';
        setScenes(newScenes);
      } else if (type === 'element') {
        const newElements = [...elements];
        newElements[index] = { ...newElements[index], src: 'error-generating-image.png' };
        setElements(newElements);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, [`${type}-${index}`]: false }));
    }
  };

  return (
    <Container fluid className="d-flex flex-column" style={{ height: 'calc(100vh - 90px)', padding: 0 }}>
      <Row className="w-100 m-0">
        <Col xs={12} className="p-0">
          <ProgressBar 
            now={stage * 33.33} 
            label={`阶段 ${stage}/3`} 
            style={{ height: '30px', borderRadius: 0 }}
            variant="purple"
          />
        </Col>
      </Row>
      <Row className="justify-content-center w-100 flex-grow-1">
        <Col xs={12} md={8} className="d-flex flex-column justify-content-center">
          {stage === 1 ? (
            <>
              <div style={{ width: '100%', padding: '4px', marginBottom: '20px' }}>
                <Form.Control
                  as="textarea"
                  value={lessonText}
                  onChange={handleLessonTextChange}
                  placeholder="请输入课文……"
                  style={{ height: 'calc(100vh - 450px)', width: '100%' }}
                />
              </div>
              <div className="d-flex justify-content-center mt-5">
                <Button onClick={handleNextStage} style={{ width: '180px' }}>
                  下一阶段
                </Button>
              </div>
            </>
          ) : stage === 2 ? (
            <>
              <div style={{ width: '100%', padding: '4px', marginBottom: '10px' }}>
                <Form className="d-flex flex-wrap justify-content-start">
                  <h3 className="w-100 mb-3">教育目标</h3>
                  {narrativeSkills.map((skill, index) => (
                    <Button
                      key={index}
                      variant={selectedSkills.includes(skill) ? "secondary" : "outline-secondary"}
                      onClick={() => handleSkillChange(skill)}
                      className="m-1"
                    >
                      {skill}
                    </Button>
                  ))}
                </Form>
              </div>
              <div style={{ width: '100%', padding: '4px', marginBottom: '10px' }}>
                <Form className="d-flex flex-wrap justify-content-start">
                  <h3 className="w-100 mb-3">关键词</h3>
                  {keywords.map((keyword, index) => (
                    <Button
                      key={index}
                      variant={selectedKeywords.includes(keyword) ? "secondary" : "outline-secondary"}
                      onClick={() => handleKeywordChange(keyword)}
                      className="m-1"
                    >
                      {keyword}
                    </Button>
                  ))}
                </Form>
              </div>
              <div style={{ width: '100%', padding: '4px', marginBottom: '10px' }}>
                <Button onClick={handleAdaptStory} style={{ width: '100%' }} disabled={isGenerating}>
                  {isGenerating? '正在生成中...':'改编故事'}
                </Button>
              </div>
              <div style={{ width: '100%', padding: '4px' }}>
                <Form.Control
                  as="textarea"
                  value={storyText}
                  onChange={handleStoryTextChange}
                  style={{ height: 'calc(100vh - 550px)', width: '100%' }}
                />
              </div>
              <div className="d-flex justify-content-between mt-3" style={{ width: '400px', margin: '0 auto' }}>
                <Button onClick={handlePreviousStage} style={{ width: '180px' }}>
                  上一阶段
                </Button>
                <Button 
                  onClick={handleNextStage} 
                  style={{ width: '180px' }} 
                  disabled={isGenerating}
                >
                  {isGenerating ? '正在生成中...' : '下一阶段'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 'calc(100vh - 120px)'
                }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#DDA0DD" strokeWidth="8" strokeDasharray="62.83 62.83">
                      <animateTransform
                        attributeName="transform"
                        attributeType="XML"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', marginBottom: '20px', paddingTop: '10px', paddingBottom: '30px' }}>
                  <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>场景</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '15px', flex: '1', justifyItems: 'center', alignItems: 'center', border: '2px solid #ccc', padding: '15px', borderRadius: '10px' }}>
                    {scenes.map((src, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          position: 'relative', 
                          width: '90%', 
                          height: '90%',
                          overflow: 'hidden',
                          border: '2px solid transparent',
                          transition: 'border-color 0.3s ease-in-out'
                        }}
                        onClick={() => handleImageClick(index, 'scene')}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#DDA0DD'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                      >
                        <img 
                          src={src} 
                          alt={`Scene ${index + 1}`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }} 
                        />
                        {loadingStates[`scene-${index}`] && (
                          <div 
                            style={{
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              width: '100%',
                              height: '100%',
                              backgroundColor: 'rgba(255, 255, 255, 0.7)',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}
                          >
                            <svg width="50" height="50" viewBox="0 0 50 50">
                              <circle cx="25" cy="25" r="20" fill="none" stroke="black" strokeWidth="3" strokeDasharray="31.4 31.4">
                                <animateTransform
                                  attributeName="transform"
                                  attributeType="XML"
                                  type="rotate"
                                  from="0 25 25"
                                  to="360 25 25"
                                  dur="1s"
                                  repeatCount="indefinite"
                                />
                              </circle>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <h3 style={{ textAlign: 'center', marginTop: '20px', marginBottom: '15px' }}>元素</h3>
                  <div style={{ border: '2px solid #ccc', borderRadius: '10px', padding: '15px', marginTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', overflowX: 'auto', flex: '0 0 60px' }}>
                      {elements.map((image, index) => (
                        <div 
                          key={index}
                          style={{ 
                            position: 'relative', 
                            height: '100%',
                            flex: '0 0 auto',
                            overflow: 'hidden',
                            border: '2px solid transparent',
                            transition: 'border-color 0.3s ease-in-out',
                            marginRight: '10px'
                          }}
                          onClick={() => handleImageClick(index, 'element')}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#DDA0DD'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                          <img 
                            src={image.src} 
                            alt={image.name} 
                            style={{ 
                              height: '100%'
                            }} 
                          />
                          {loadingStates[`element-${index}`] && (
                            <div 
                              style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                            >
                              <svg width="30" height="30" viewBox="0 0 30 30">
                                <circle cx="15" cy="15" r="12" fill="none" stroke="black" strokeWidth="2" strokeDasharray="18.84 18.84">
                                  <animateTransform
                                    attributeName="transform"
                                    attributeType="XML"
                                    type="rotate"
                                    from="0 15 15"
                                    to="360 15 15"
                                    dur="1s"
                                    repeatCount="indefinite"
                                  />
                                </circle>
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', margin: '20px 0 10px' }}>
                    点击图片可以重新生成
                  </div>
                  <div className="d-flex justify-content-between" style={{ width: '400px', margin: '0 auto' }}>
                    <Button onClick={handlePreviousStage} style={{ width: '180px' }}>
                      上一阶段
                    </Button>
                    <Button onClick={handleNextStep} style={{ width: '180px' }}>
                      下一步
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ParentPage;
