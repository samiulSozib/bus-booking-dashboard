import * as Yup from 'yup';

export const getStationSchema = (t) =>
    Yup.object().shape({
      stationName: Yup.object().shape({
        en: Yup.string().required(t('station.stationNameRequiredEn')),
        ps: Yup.string().optional(),
        fa: Yup.string().optional(),
      }),
      stationLat: Yup.number()
        .typeError(t('station.latitudeTypeError'))
        .required(t('station.latitudeRequired'))
        .min(-90, t('station.latitudeMin'))
        .max(90, t('station.latitudeMax')),
      stationLong: Yup.number()
        .typeError(t('station.longitudeTypeError'))
        .required(t('station.longitudeRequired'))
        .min(-180, t('station.longitudeMin'))
        .max(180, t('station.longitudeMax')),
      countryId: Yup.string().required(t('station.countryRequired')),
      provinceId: Yup.string().required(t('station.provinceRequired')),
      cityId: Yup.string().required(t('station.cityRequired')),
    });