// after home and recent
import React, { useEffect, useRef, useState } from 'react';
import { Alert, View, ScrollView, TouchableOpacity, BackHandler, AppState,DeviceEventEmitter  } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import Bold from 'typography/bold-text';
import Medium from 'typography/medium-text';
import { Row } from 'components/atoms/row';
import { Checkbox } from 'components/atoms/checkbox';
import { PrimaryButton } from 'components/atoms/buttons';
import styles from './styles';
import { useIsFocused } from '@react-navigation/native';
import { getQuizQuestions, submitQuiz } from 'services/api/auth-api-actions';
import { colors } from 'config/colors';
import { navigate } from 'navigation/navigation-ref';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Loader } from 'components/atoms/loader';
import { disallowScreenshot } from 'react-native-screen-capture';

const QuizAttempt = ({ route }) => {
  const { quizId } = route?.params;
  const { isBounded } = route?.params;
  const { boundTime } = route?.params;

  // States for quiz data
  const [questions, setQuestions] = useState([]);
  const [timeAllowed, setTimeAllowed] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Timer related states
  const timeRef = useRef(0);
  const [displayMinutes, setDisplayMinutes] = useState(0);
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const [lastActiveTime, setLastActiveTime] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);
  
  // Quiz progress states
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const isFocused = useIsFocused();

  // Bounded time per question states
  const [questionKey, setQuestionKey] = useState(0);
  const [isQuestionTimerPlaying, setIsQuestionTimerPlaying] = useState(true);
  
  // Submission control state
  const [isSubmitting, setIsSubmitting] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false); // Add this state
    const [isInBackground, setIsInBackground] = useState(false);
      const [appInForeground, setAppInForeground] = useState(true);
  const appStateRef = useRef(AppState.currentState);
  const questionsRef = useRef([]);


  const formatQuestions = (apiQuestions) => {
    return apiQuestions.map(question => {
      const options = [];
      let choiceIndex = 1;
      
      while (question[`choice${choiceIndex}`] !== undefined) {
        options.push({
          id: `choice${choiceIndex}`,
          text: question[`choice${choiceIndex}`]
        });
        choiceIndex++;
      }

      return {
        id: question.id,
        text: question.question,
        options: options,
        correctAnswer: question.answer
      };
    });
  };

const prepareSubmissionData = () => {
  // Use questions from ref if state is empty
  const questionsToUse = questions.length > 0 ? questions : questionsRef.current;
  
  if (!questionsToUse || questionsToUse.length === 0) {
    console.error('No questions available for submission');
    return { answers: [] };
  }

  const submissionAnswers = questionsToUse.map(question => {
    const selectedOptionId = selectedOptions[question.id];
    let answerText = "No Answered";
    
    if (selectedOptionId) {
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId);
      answerText = selectedOption ? selectedOption.text : "No Answered";
    }

    return {
      question_id: question.id,
      std_answer: answerText
    };
  });

  return {
    answers: submissionAnswers
  };
};

// Enhanced handleAutoSubmit with additional checks
const handleAutoSubmit = async (message, shouldNavigate = true) => {
  if (isSubmitting) return;
  setIsSubmitting(true);
  setAlertVisible(true);

  // Double check we have questions data
  if (questions.length === 0 && questionsRef.current.length === 0) {
    Alert.alert('Error', 'No quiz data available for submission');
    setIsSubmitting(false);
    setAlertVisible(false);
    return;
  }

  const submissionData = prepareSubmissionData();
  console.log('Auto-submitting with data:', JSON.stringify(submissionData, null, 2));

  if (submissionData.answers.length === 0) {
    Alert.alert('Error', 'No answers available for submission');
    setIsSubmitting(false);
    setAlertVisible(false);
    return;
  }

  const submissionSuccess = await handleQuizSubmission(shouldNavigate);
  
  Alert.alert(
    'Attention', 
    message,
    submissionSuccess ? [
      {
        text: 'OK',
        onPress: () => {
          setAlertVisible(false);
          if (shouldNavigate) {
            navigate('Quiz');
          }
        }
      }
    ] : [
      {
        text: 'Retry',
        onPress: async () => {
          await handleAutoSubmit(message, shouldNavigate);
        }
      },
      {
        text: 'Cancel',
        onPress: () => {
          setAlertVisible(false);
          setIsSubmitting(false);
        },
        style: 'cancel'
      }
    ],
    { cancelable: false }
  );
};
const handleQuizSubmission = async (navigateAfter = true) => {
  const submissionData = prepareSubmissionData();
  
  // Debug log to verify submission data
  console.log('Submitting quiz with data:', JSON.stringify(submissionData, null, 2));

  try {
    await submitQuiz(submissionData, quizId);
    if (navigateAfter) {
      navigate('Quiz');
    }
    return true;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    console.log('Submission data that failed:', JSON.stringify(submissionData, null, 2));
    Alert.alert('Submission Error', 'Failed to submit quiz. Please try again.');
    return false;
  }
};

   const handleTimeUp = async () => {
    if (isSubmitting || alertVisible) return;
    await handleAutoSubmit('Time is up! Your quiz will be submitted automatically in 3 seconds.');
    Alert.alert('Time Up!', 'Your quiz has been automatically submitted.');
  };

const moveToNextQuestion = () => {
  if (currentQuestionIndex < questions.length - 1) {
    setCurrentQuestionIndex((prev) => prev + 1);
    setQuestionKey(prevKey => prevKey + 1);
    // Only play timer if the next question is bounded
    setIsQuestionTimerPlaying(isBounded === 'bound');
  }
};

const handleQuestionTimerComplete = () => {
  setIsQuestionTimerPlaying(false);
  
  // If this is the last question, submit the quiz
  if (currentQuestionIndex >= questions.length - 1) {
    if (!isSubmitting) {
      handleAutoSubmit('Question time is up! Your quiz will be submitted automatically in 3 seconds.');
    }
    return { shouldRepeat: false };
  }
  
  // For other questions, move to next question automatically
  moveToNextQuestion();
  return { shouldRepeat: false };
};

    useEffect(() => {
    if (!isFocused && !isSubmitting && !alertVisible) {
      handleAutoSubmit('You left the quiz. Your answers are being submitted.', true);
    }
  }, [isFocused, isSubmitting, alertVisible]);

  const handleFinishConfirmation = () => {
    Alert.alert(
      'Submit Quiz?',
      'Are you sure you want to submit your answers?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Submit',
          onPress: () => handleQuizSubmission(),
        },
      ]
    );
  };

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        "Exit Quiz",
        "Are you sure you want to exit the quiz? Your answers will be submitted automatically.",
        [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: async () => {
              const submissionData = prepareSubmissionData();
              try {
                await submitQuiz(submissionData, quizId);
                navigate('Quiz');
              } catch (error) {
                Alert.alert('Submission Error', 'Failed to submit quiz. Please try again.');
              }
            }
          }
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [selectedOptions, questions]);

 useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came back to foreground
        setAppInForeground(true);
        const timeSpentInBackground = Math.floor((Date.now() - lastActiveTime) / 1000);
        if (timeRef.current > timeSpentInBackground) {
          timeRef.current -= timeSpentInBackground;
        } else {
          timeRef.current = 0;
          if (!isSubmitting && !alertVisible) {
            handleTimeUp();
          }
        }
        updateTimerDisplay();
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        setAppInForeground(false);
        setLastActiveTime(Date.now());
        setIsQuestionTimerPlaying(false);
        
        // Submit immediately when going to background
        if (!isSubmitting && !alertVisible) {
          await handleAutoSubmit('You navigated away from the quiz. Your answers are being submitted.', true);
        }
      }
      appStateRef.current = nextAppState;
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // For Android, add additional listeners
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Already handled in your existing backHandler
        return false;
      });

      // Additional Android-specific listeners
      DeviceEventEmitter.addListener('activityPaused', () => {
        if (isFocused && !isSubmitting && !alertVisible) {
          handleAutoSubmit('You left the quiz. Your answers are being submitted.', true);
        }
      });

      return () => {
        subscription.remove();
        backHandler.remove();
        DeviceEventEmitter.removeAllListeners('activityPaused');
      };
    }

    return () => subscription.remove();
  }, [isSubmitting, alertVisible, isFocused]);

  const updateTimerDisplay = () => {
    const mins = Math.floor(timeRef.current / 60);
    const secs = timeRef.current % 60;
    setDisplayMinutes(mins);
    setDisplaySeconds(secs);
  };

const fetchQuizQuestionsList = async () => {
  try {
    setLoading(true);
    const response = await getQuizQuestions(parseInt(quizId));
    const quizData = response?.data || {};
    
    const formattedQuestions = formatQuestions(quizData.questions);
    setQuestions(formattedQuestions);
    questionsRef.current = formattedQuestions; // Store in ref
    
    setTimeAllowed(quizData?.time_allowed || 60);
    setTotalQuestions(quizData.total_questions);
    
    timeRef.current = quizData?.time_allowed || 60;
    updateTimerDisplay();
    
  } catch (err) {
    console.error('Failed to fetch data', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (isFocused) {
      fetchQuizQuestionsList();
    }
  }, [isFocused]);

 useEffect(() => {
    if (timeAllowed <= 0) return;

    const interval = setInterval(() => {
      if (timeRef.current <= 1) {
        clearInterval(interval);
        if (!isSubmitting && !alertVisible) {
          handleTimeUp();
        }
        return;
      }

      timeRef.current -= 1;
      updateTimerDisplay();
    }, 1000);

    return () => clearInterval(interval);
  }, [timeAllowed, isSubmitting, alertVisible]);

  const currentQuestion = questions[currentQuestionIndex] || {};
  const options = currentQuestion.options || [];

  const handleOptionSelect = (optionId) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

 const handleNext = () => {
  // Check if user hasn't selected an answer
  if (!selectedOptions[currentQuestion.id]) {
    // Case 1: Question has bound time and it's still running
    if (isBounded === 'bound' && isQuestionTimerPlaying) {
      Alert.alert('Please select an option', 'You must select an answer before proceeding.');
      return;
    }
    // Case 2: Question doesn't have bound time (always show alert)
    else if (isBounded !== 'bound') {
      Alert.alert('Please select an option', 'You must select an answer before proceeding.');
      return;
    }
    // Case 3: Bound time has ended (no alert, just proceed)
  }

  // If we get here, either user selected an answer or bound time ended without selection
  if (currentQuestionIndex < questions.length - 1) {
    moveToNextQuestion();
  } else {
    handleFinishConfirmation();
  }
};

  useEffect(() => {
    console.log('Disabling screenshots...');
    disallowScreenshot(true);
    return () => {
      console.log('Re-enabling screenshots...');
      disallowScreenshot(false);
    };
  }, []);

  return (
    <View style={styles.container}>
      {loading || questions.length === 0 ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Bold label={'Remaining time'} style={styles.reimtimerLabel} />
          <Row style={styles.timerRow}>
            <CircularProgress
              value={displayMinutes}
              radius={60}
              maxValue={Math.floor(timeAllowed / 60)}
              title={'Minutes'}
              titleColor={'#333'}
              titleStyle={{ fontWeight: 'normal' }}
              activeStrokeColor={colors.primary}
              inActiveStrokeColor="#ecf0f1"
              inActiveStrokeOpacity={0.5}
              progressValueColor={colors.primary}
            />

            <CircularProgress
              value={displaySeconds}
              radius={60}
              maxValue={60}
              title={'Seconds'}
              titleColor={'#333'}
              titleStyle={{ fontWeight: 'normal' }}
              activeStrokeColor="#e74c3c"
              inActiveStrokeColor="#c1cbceff"
              inActiveStrokeOpacity={0.5}
              progressValueColor="#c0392b"
            />
          </Row>

          <View style={styles.questionContainer}>
            <Row style={{alignItems:'center'}}>
              <Medium 
                label={`Question ${currentQuestionIndex + 1} of ${questions.length}`} 
                style={styles.questionCounter} 
              />
              
              <View>
                {isBounded === 'bound' && (
                <CountdownCircleTimer
                  key={questionKey}
                  isPlaying={isQuestionTimerPlaying}
                  duration={boundTime}
                  colors={['#2ecc71', '#27ae60', '#219653', '#1e8449']}
                  colorsTime={[boundTime, boundTime * 0.66, boundTime * 0.33, 0]}
                  size={40}
                  strokeWidth={4}
                  onComplete={handleQuestionTimerComplete}
                >
                  {({ remainingTime }) => (
                    <View style={{ alignItems: 'center' }}>
                      <Bold label={remainingTime} style={{ fontSize: 16, color: colors.primary }} />
                    </View>
                  )}
                </CountdownCircleTimer>
              )}
              </View>
            </Row>
            
            <Bold 
              label={currentQuestion.text} 
              style={[styles.questionLabel, { color: colors.primary }]} 
              numberOfLines={100} 
            />
            
            <View style={styles.optionsContainer}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    selectedOptions[currentQuestion.id] === option.id && styles.selectedOption
                  ]}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Checkbox
                    checked={selectedOptions[currentQuestion.id] === option.id}
                    onPress={() => handleOptionSelect(option.id)}
                    color={colors.primary}
                  />
                  <Medium 
                    label={option.text} 
                    numberOfLines={7}
                    style={[
                      styles.optionText,
                      selectedOptions[currentQuestion.id] === option.id && { color: colors.black }
                    ]} 
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <PrimaryButton 
            loading={loading}
            title={currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"} 
            onPress={handleNext} 
            style={styles.button}
          />
        </ScrollView>
      )}
    </View>
  );
};

export default QuizAttempt;