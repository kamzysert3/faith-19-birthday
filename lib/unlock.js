import axios from "axios";

/**
 * Use this method to unlock rewards when a journey has been completed;
 * Returns a Promise that resolves when the unlock is complete
 * 
 * @param progress Number - current journey index completed
 * @param rewardType enum (Poem, Story) - type of reward to be unlocked
 * @param reward String - ._id of reward to be unlocked 
 * @returns Promise<boolean>
 * 
 * @example await Unlock(0, "Story", "eb02f89sd8c43h534")
 */
export async function Unlock(progress, rewardType, reward) {
    try {
        await axios.put('/api/progress', {
            progress,
            rewardType,
            reward
        });
        return true;
    } catch (error) {
        console.error('Failed to unlock:', error);
        return false;
    }
}