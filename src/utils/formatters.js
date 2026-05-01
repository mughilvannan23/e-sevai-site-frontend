/**
 * Transforms "In Progress" work status to "Pending" for UI display.
 * Keeps other statuses unchanged.
 * @param {string} status - The original status from database/API
 * @returns {string} - The status to display in UI
 */
export const formatWorkStatus = (status) => {
  return status === 'In Progress' ? 'Pending' : status;
};
