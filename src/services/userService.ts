import User, { IUser } from '../models/User';

export const getUserProfile = async (
  sessionId: string
): Promise<IUser | null> => {
  return await User.findOne({ sessionId });
};

export const updateUserProfile = async (
  sessionId: string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findOneAndUpdate({ sessionId }, updateData, { new: true });
};

export const deleteUserProfile = async (
  sessionId: string
): Promise<IUser | null> => {
  return await User.findOneAndDelete({ sessionId });
};

export const logoutUser = async (sessionId: string): Promise<void> => {
  const user = await User.findOne({ sessionId });
  if (user) {
    user.sessionId = undefined;
    await user.save();
  }
};

export const promoteToAdmin = async (userId: string): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, { role: 'admin' }, { new: true });
};
