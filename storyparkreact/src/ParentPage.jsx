import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ParentPage = () => {
  const [showResults, setShowResults] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [storyText, setStoryText] = useState('');
  const navigate = useNavigate();

  const narrativeSkills = [
    '角色塑造', '情节构建', '场景描述', '对话创作', '情感表达'
  ];

  const handleSkillChange = (skill) => {
    setSelectedSkills(prevSkills =>
      prevSkills.includes(skill)
        ? prevSkills.filter(s => s !== skill)
        : [...prevSkills, skill]
    );
  };

  const handleGenerate = () => {
    if (selectedSkills.length > 0) {
      setShowResults(true);
      setStoryText('这里是生成的故事文本...');  // 实际应用中，这里应该调用API生成故事
    } else {
      alert('请至少选择一个叙事能力');
    }
  };

  const handleReset = () => {
    setStoryText('');
    // 重新生成故事文本
    if (selectedSkills.length > 0) {
      setStoryText('这里是新生成的故事文本...');  // 实际应用中，这里应该调用API重新生成故事
    }
  };

  const handleNextStep = () => {
    // 导航到第一阶段的 StoryPage
    navigate('/StoryPage');
  };

  return (
    <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Row className="justify-content-center w-100">
        <Col xs={12} md={6} className="text-center">
          <div style={{ width: '100%', maxWidth: '400px', border: '1px solid #ccc', borderRadius: '10px', padding: '20px', margin: '0 auto' }}>
            <Form>
              <h3>教育目标</h3>
              {narrativeSkills.map((skill, index) => (
                <Button
                  key={index}
                  variant={selectedSkills.includes(skill) ? "secondary" : "outline-secondary"}
                  onClick={() => handleSkillChange(skill)}
                  className="m-2"
                >
                  {skill}
                </Button>
              ))}
              <Button 
                onClick={showResults ? handleReset : handleGenerate} 
                className="mt-3"
                style={{ width: '100%' }}
              >
                {showResults ? '再试一次' : '确定生成'}
              </Button>
            </Form>
          </div>
          {showResults && (
            <div style={{ width: '100%', maxWidth: '400px', margin: '20px auto 0' }}>
              <Form.Control
                as="textarea"
                value={storyText}
                readOnly
                style={{ height: '200px', width: '100%' }}
              />
            </div>
          )}
        </Col>
        {showResults && (
          <Col xs={12} md={6} className="text-center d-flex align-items-center">
            <img src="1-0.png" alt="Generated Story" style={{ maxWidth: '100%', height: 'auto' }} />
          </Col>
        )}
      </Row>
      {showResults && (
        <Row className="justify-content-center w-100 mt-5">
          <Col xs={12} className="text-center">
            <Button onClick={handleNextStep} className="mt-3" style={{ width: '200px' }}>
              确定并下一步
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default ParentPage;
