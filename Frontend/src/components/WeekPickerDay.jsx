import { styled } from '@mui/material/styles';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import dayjs from 'dayjs';
import isBetweenPlugin from 'dayjs/plugin/isBetween';

dayjs.extend(isBetweenPlugin);

const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) => 
    prop !== 'isSelected' && 
    prop !== 'isHovered',
})(({ theme, isSelected, isHovered }) => ({
  borderRadius: '50%',
  margin: '2px',
  height: 36,
  width: 36,
  backgroundColor: isSelected ? '#0095ff' : 'transparent',
  color: isSelected ? 'white' : theme.palette.text.primary,
  '&:hover, &:focus': {
    backgroundColor: isSelected ? '#0095ff' : 'transparent',
  },
  '&.Mui-focused': {
    backgroundColor: isSelected ? '#0095ff' : 'transparent',
  },
  '&:hover': {
    backgroundColor: isSelected ? '#0095ff' : 'transparent',
  },
  ...(isHovered && {
    backgroundColor: 'transparent',
    '&:hover, &:focus': {
      backgroundColor: 'transparent',
    },
  }),
}));

const isInSelectedWeeks = (day, selectedWeeks) => {
  if (!selectedWeeks || selectedWeeks.length === 0) return false;
  return selectedWeeks.some(selectedDay => 
    dayjs(selectedDay).startOf('week').isSame(dayjs(day).startOf('week'))
  );
};

export default function WeekPickerDay(props) {
  const { day, selectedWeeks, hoveredDay, ...other } = props;

  const isSelected = isInSelectedWeeks(day, selectedWeeks);
  const isHovered = hoveredDay && day.isSame(hoveredDay, 'week');

  return (
    <CustomPickersDay
      {...other}
      day={day}
      sx={{ px: 2.5 }}
      disableMargin
      isSelected={isSelected}
      isHovered={isHovered && !isSelected}
    />
  );
}
