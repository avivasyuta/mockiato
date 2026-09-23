import { FC } from 'react';
import { Alert, Button, Group, Text } from '@mantine/core';
import { IconAlertCircle, IconBug, IconThumbUp } from '@tabler/icons-react';

import { extensionUrl, newIssueUrl } from '~/contstant';

import classes from './RatingPrompt.module.css';
import { useRatingPrompt } from './useRatingPrompt';

export const RatingPrompt: FC = () => {
  const { isVisible, mockHits, onRate, onDismiss } = useRatingPrompt();

  if (!isVisible) {
    return null;
  }

  return (
    <Alert
      variant="light"
      color="blue"
      withCloseButton
      title={`Mockiato has mocked ${mockHits} requests for you so far!`}
      icon={<IconAlertCircle />}
      className={classes.root}
      onClose={onDismiss}
    >
      <Text fz="sm">If it saves you time, a quick rating in the Chrome Web Store would mean a lot.</Text>

      <Group
        gap="xs"
        mt="lg"
        justify="space-between"
      >
        <Button
          component="a"
          href={extensionUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          radius="sm"
          color="green"
          leftSection={<IconThumbUp size={16} />}
          onClick={onRate}
        >
          Rate Mockiato
        </Button>

        <Button
          component="a"
          href={newIssueUrl}
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          radius="sm"
          variant="subtle"
          color="gray"
          leftSection={<IconBug size={16} />}
          onClick={onDismiss}
        >
          Report a problem
        </Button>
      </Group>
    </Alert>
  );
};
