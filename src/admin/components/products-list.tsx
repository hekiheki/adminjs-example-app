import React from 'react';
import { Box, FormGroup, Label, Table, TableBody, TableCell, TableHead, TableRow } from '@adminjs/design-system';
import { useTranslation } from 'adminjs';

const ProductsList = () => {
  const { translateLabel } = useTranslation();

  return (
    <FormGroup mb={24}>
      <Label>Products list</Label>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{translateLabel('ID')}</TableCell>
              <TableCell>{translateLabel('Name')}</TableCell>
              <TableCell>{translateLabel('Quantity')}</TableCell>
              <TableCell>{translateLabel('Unit price')}</TableCell>
              <TableCell>{translateLabel('Sum')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                No records
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </FormGroup>
  );
};

export default ProductsList;
