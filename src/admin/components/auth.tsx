import { useCurrentAdmin, ApiClient } from 'adminjs';

const api = new ApiClient();

const AuthenticationBackgroundComponent = async (props) => {
  const [currentAdmin, setCurrentAdmin] = useCurrentAdmin();

  console.log('AuthenticationBackgroundComponentOverride', props);
  // ...
  // A part of your code responsible for refreshing user's session
  // const requestBody = {};
  // const response = await api.refreshToken(requestBody);

  // const { data } = response;

  // setCurrentAdmin(data);
  // ...
  return null;
};

export default AuthenticationBackgroundComponent;
