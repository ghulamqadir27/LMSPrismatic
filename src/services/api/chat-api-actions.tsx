import {Alert} from 'react-native';
import {AppDispatch, RootState} from 'store';
import {UTILS} from 'utils';
import {getData, postData, putData} from '.';
import {URLS} from './api-urls';
import {setConversations} from '../../store/reducers/chat-reducer';
import showToast from 'components/atoms/show-toast';

// getConversationsList
export const getConversationsList = (setLoading: (bool: boolean) => void) => {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const res = await getData(`${URLS.chat.get_conservation}`);
      console.log('res: getConversationsList::', res);
      dispatch(setConversations(res?.data || []));
    } catch (error: any) {
      console.log('error in getConversationsList', UTILS.returnError(error));
      // Alert.alert('Error', UTILS.returnError(error));
      showToast({
        type: 'error',
        text1: 'Failed',
        text2: UTILS.returnError(error),
      });
    } finally {
      setLoading(false);
    }
  };
};
// export const getChatMessages = (id: any) => getData(`${URLS.chat.get_chat_messages}${id}`)

export const getChatMessages = (id: any, pageNumber: any) => {
  let url = `${URLS.chat.get_chat_messages}${id}?page=${pageNumber}`;
  return getData(url);
};

// {{conversation_id}}/{{last_message_id}}
export const getChatHistory = (page = 1) =>
  getData(`${URLS.chat.get_chat_messages}?page=${page}`);
export const onSendMessage = (data: any) =>
  postData(`${URLS.chat.send_message}`, data);
export const onSendChat = (data: any) =>
  postData(`${URLS.chat.send_chat}`, data);
export const onUpdateChat = (chatIdToUpdate: any, data: any) => {
  console.log('onUpdateChat::', chatIdToUpdate, data);
  postData(`${URLS.chat.update_chat}${chatIdToUpdate}`, data);
};
export const onCreateConveration = (data: any) =>
  postData(`${URLS.chat.create_conservation}`, data);
