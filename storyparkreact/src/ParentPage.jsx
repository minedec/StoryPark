import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ParentPage = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [storyText, setStoryText] = useState('');
  const [stage, setStage] = useState(1);
  const [lessonText, setLessonText] = useState('');
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

  const narrativeSkills = [
    '角色塑造', '情节构建', '场景描述', '对话创作', '情感表达'
  ];

  const keywords = [
    '友谊', '勇气', '诚实', '责任', '创新'
  ];

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

  const handleGenerate = () => {
    if (selectedSkills.length > 0) {
      setStoryText('这里是新生成的故事文本...');  // 实际应用中，这里应该调用API生成故事
    } else {
      alert('请至少选择一个叙事能力');
    }
  };

  const handleNextStage = () => {
    if (stage === 1) {
      setStoryText(lessonText);
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
    navigate('/StoryPage');
  };

  const handleStoryTextChange = (event) => {
    setStoryText(event.target.value);
  };

  const handleLessonTextChange = (event) => {
    setLessonText(event.target.value);
  };

  const handleAdaptStory = () => {
    setStoryText('这里是改编后的故事文本...');  // 实际应用中，这里应该调用API改编故事
  };

  const handleImageClick = (index, type) => {
    setLoadingStates(prev => ({ ...prev, [`${type}-${index}`]: true }));

    setTimeout(() => {
      if (type === 'scene') {
        const newScenes = [...scenes];
        newScenes[index] = `new-scene-${index}.png`;
        setScenes(newScenes);
      } else if (type === 'element') {
        const newElements = [...elements];
        newElements[index] = { ...newElements[index], src: `new-element-${index}.png` };
        setElements(newElements);
      }
      setLoadingStates(prev => ({ ...prev, [`${type}-${index}`]: false }));
    }, 3000);
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
                <Button onClick={handleAdaptStory} style={{ width: '100%' }}>
                  改编故事
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
                <Button onClick={handleNextStage} style={{ width: '180px' }}>
                  下一阶段
                </Button>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ParentPage;
