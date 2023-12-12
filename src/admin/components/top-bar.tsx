import { Box, Avatar, Text, Icon, Link } from '@adminjs/design-system';
import { ReduxState, useTranslation } from 'adminjs';
import React, { FC } from 'react';
import { useSelector } from 'react-redux';

const TopBar: FC = () => {
  const { translateComponent } = useTranslation();
  const session = useSelector((state: ReduxState) => state.session);
  const { username, nick, avatarUrl } = session;

  if (!session) return null;

  return (
    <Box flex flexGrow={1} justifyContent="end" alignItems="center">
      <Text ml="xl" mr="auto">
        {nick || username}
      </Text>
      <Avatar src={avatarUrl} alt={nick || username} mr="lg">
        <Icon icon="User" />
      </Avatar>
      <Link href="/logout" ml="md">
        <Icon icon="LogOut" />
      </Link>
    </Box>
  );
};

export { TopBar };
export default TopBar;
