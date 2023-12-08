import React, { FC, useState, useEffect, useCallback } from 'react';
import { FormGroup, FormMessage, Label, SelectAsync } from '@adminjs/design-system';
import { ApiClient, EditPropertyPropsInArray, RecordJSON, SelectRecord, flat, useTranslation } from 'adminjs';

type CombinedProps = EditPropertyPropsInArray;
type SelectRecordEnhanced = SelectRecord;

const api = new ApiClient();

const EditManyToManyInput: FC<CombinedProps> = (props) => {
  const { onChange, property, record } = props;
  const { reference: resourceId, custom } = property;

  if (!resourceId) {
    throw new Error(`Cannot reference resource in property '${property.path}'`);
  }

  const { translateProperty } = useTranslation();

  const handleChange = (selected: any[] | any): void => {
    const currentSelected = property.isArray ? selected : [selected];
    setSelectedOptions(currentSelected);
    if (selected) {
      onChange(
        property.path,
        currentSelected.map((option) => ({
          id: option.value,
        })),
      );
    } else {
      onChange(property.path, null);
    }
  };

  const error = record?.errors[property.path];

  const selectedValues = flat.unflatten(record.params)[property.path] || [];

  const [loadingRecord] = useState(0);
  const selectedValuesToOptions = selectedValues.map((selectedValue) => ({
    value: Number(selectedValue.id),
    label: translateProperty(selectedValue.name, resourceId),
  }));
  const [selectedOptions, setSelectedOptions] = useState(selectedValuesToOptions);

  const loadOptions = useCallback(
    async (inputValue: string): Promise<SelectRecordEnhanced[]> => {
      const optionRecords = await api.searchRecords({
        resourceId,
        query: inputValue,
      });

      if (!record?.params?.id && custom?.default) {
        const defaultOption = optionRecords.find((option) => option.title === custom?.default);
        setSelectedOptions([
          {
            value: defaultOption?.id,
            label: translateProperty(defaultOption?.title, resourceId),
          },
        ]);
      }

      return optionRecords.map((optionRecord: RecordJSON) => ({
        value: optionRecord.id,
        label: translateProperty(optionRecord.title, resourceId),
      }));
    },
    [custom?.default, record?.params?.id, resourceId, translateProperty],
  );

  return (
    <FormGroup error={Boolean(error)}>
      <Label>{translateProperty(property.label, property.resourceId)}</Label>
      <SelectAsync
        isMulti={property.isArray}
        cacheOptions
        value={property.isArray ? selectedOptions : selectedOptions.length ? selectedOptions[0] : null}
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
