import React from 'react';
import { CurrentUserNav, Box, CurrentUserNavProps } from '@adminjs/design-system';
import { useTranslation, CurrentAdmin } from 'adminjs';

export type LoggedInProps = {
  session: CurrentAdmin;
  paths: {
    logoutPath: string;
  };
};

const LoggedIn: React.FC<LoggedInProps> = (props) => {
  const { session, paths } = props;
  const { translateButton } = useTranslation();

  const dropActions: CurrentUserNavProps['dropActions'] = [
    {
      label: translateButton('logout'),
      onClick: (event: Event): void => {
        event.preventDefault();
        window.location.href = paths.logoutPath;
      },
      icon: 'LogOut',
    },
  ];

  return (
    <Box flexShrink={0} data-css="logged-in">
      <CurrentUserNav
        name={session.nick || session.username}
        title={session.title}
        avatarUrl={session.avatarUrl}
        dropActions={dropActions}
      />
    </Box>
  );
};

export { LoggedIn };
export default LoggedIn;
