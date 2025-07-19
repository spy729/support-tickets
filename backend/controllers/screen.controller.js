import screens from '../register.json' assert { type: 'json' };

export const getScreensForTenant = (req, res) => {
  const customerId = req.user?.customerId;

  if (!customerId) {
    return res.status(401).json({ message: 'Unauthorized: No customerId in token' });
  }

  const tenantScreens = screens.filter(screen => screen.tenant === customerId);
  res.json(tenantScreens);
};
