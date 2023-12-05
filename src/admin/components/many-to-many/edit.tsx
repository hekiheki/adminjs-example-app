import React, { FC, useState } from 'react';
import { FormGroup, FormMessage, Label, SelectAsync } from '@adminjs/design-system';
import { ApiClient, EditPropertyPropsInArray, RecordJSON, SelectRecord, flat, useTranslation } from 'adminjs';

type CombinedProps = EditPropertyPropsInArray;
type SelectRecordEnhanced = SelectRecord;

const api = new ApiClient();

const EditManyToManyInput: FC<CombinedProps> = (props) => {
  const { onChange, property, record } = props;
  const { reference: resourceId } = property;

  if (!resourceId) {
    throw new Error(`Cannot reference resource in property '${property.path}'`);
  }

  const { translateProperty } = useTranslation();

  const handleChange = (selected: any[]): void => {
    setSelectedOptions(selected);
    if (selected) {
      onChange(
        property.path,
        selected.map((option) => ({ id: option.value })),
      );
    } else {
      onChange(property.path, null);
    }
  };

  const loadOptions = async (inputValue: string): Promise<SelectRecordEnhanced[]> => {
    const optionRecords = await api.searchRecords({
      resourceId,
      query: inputValue,
    });

    return optionRecords.map((optionRecord: RecordJSON) => ({
      value: optionRecord.id,
      label: optionRecord.title,
    }));
  };
  const error = record?.errors[property.path];

  const selectedValues = flat.unflatten(record.params)[property.path] || [];

  const [loadingRecord] = useState(0);
  const selectedValuesToOptions = selectedValues.map((selectedValue) => ({
    value: Number(selectedValue.id),
    label: selectedValue.name,
  }));
  const [selectedOptions, setSelectedOptions] = useState(selectedValuesToOptions);

  return (
    <FormGroup error={Boolean(error)}>
      <Label>{translateProperty(property.label, property.resourceId)}</Label>
      <SelectAsync
        isMulti={property.isArray}
        cacheOptions
        value={selectedOptions}
        defaultOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        isClearable
        isDisabled={property.isDisabled}
        isLoading={!!loadingRecord}
        {...property.props}
      />
      <FormMessage>{error?.message}</FormMessage>
    </FormGroup>
  );
};

export default EditManyToManyInput;
