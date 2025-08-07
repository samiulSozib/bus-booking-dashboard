import Badge from './Badge'; // Import your existing Badge component

const StatusBadge = ({ status }) => {
  // Map status to badge variant and color
  const getBadgeProps = (status) => {
    switch (status) {
      case 'active':
        return { color: 'success', variant: 'light' };
      case 'inactive':
        return { color: 'light', variant: 'light' };
      case 'pending':
        return { color: 'warning', variant: 'light' };
      case 'banned':
        return { color: 'error', variant: 'light' };
      default:
        return { color: 'primary', variant: 'light' };
    }
  };

  // Capitalize first letter
  const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : '';

  const badgeProps = getBadgeProps(status);

  return (
    <Badge {...badgeProps} size="sm">
      {formattedStatus}
    </Badge>
  );
};

export default StatusBadge;