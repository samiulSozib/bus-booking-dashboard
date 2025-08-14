import * as Yup from 'yup';

export const getStationSchema = (t) =>
    Yup.object().shape({
      stationName: Yup.object().shape({
        en: Yup.string().required(t('station.stationNameRequiredEn')),
        ps: Yup.string().optional(),
        fa: Yup.string().optional(),
      }),
      
      countryId: Yup.string().required(t('station.countryRequired')),
      provinceId: Yup.string().required(t('station.provinceRequired')),
      cityId: Yup.string().required(t('station.cityRequired')),
    });