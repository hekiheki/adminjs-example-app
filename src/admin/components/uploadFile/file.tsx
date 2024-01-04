import { Box, Button, Icon } from '@adminjs/design-system';
import { flat, ShowPropertyProps } from 'adminjs';
import React, { FC } from 'react';

type Props = ShowPropertyProps & {
  width?: number | string;
};

type SingleFileProps = {
  name: string;
  path?: string;
  mimeType?: string;
  width?: number | string;
};

export const ImageMimeTypes = [
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/vnd.microsoft.icon',
  'image/tiff',
  'image/webp',
] as const;

const SingleFile: FC<SingleFileProps> = (props) => {
  const { name, path, mimeType, width } = props;

  if (path && path.length) {
    if (mimeType && ImageMimeTypes.includes(mimeType as any)) {
      return <img src={path} style={{ maxHeight: width, maxWidth: width }} alt={name} />;
    }
  }
  return (
    <Box>
      <Button as="a" href={path} ml="default" size="sm" rounded target="_blank">
        <Icon icon="DocumentDownload" color="white" mr="default" />
        {name}
      </Button>
    </Box>
  );
};

const File: FC<Props> = ({ width, record, property }) => {
  const { custom } = property as unknown as { custom: any };

  let path = flat.get(record?.params, custom.filePathProperty);

  if (!path) {
    return null;
  }

  const name = flat.get(record?.params, custom.fileNameProperty ? custom.fileNameProperty : custom.keyProperty);

  const mimeType = custom.mimeTypeProperty && flat.get(record?.params, custom.mimeTypeProperty);

  if (!property.custom.multiple) {
    if (custom.opts && custom.opts.baseUrl) {
      path = `${custom.opts.baseUrl}/${name}`;
    }
    return <SingleFile path={path} name={name} width={width} mimeType={mimeType} />;
  }
  if (custom.opts && custom.opts.baseUrl) {
    const baseUrl = custom.opts.baseUrl || '';
    path = path.map((singlePath, index) => `${baseUrl}/${name[index]}`);
  }

  return (
    <>
      {path.map((singlePath, index) => (
        <SingleFile key={singlePath} path={singlePath} name={name[index]} width={width} mimeType={mimeType[index]} />
      ))}
    </>
  );
};

export default File;
