import { User, Guild, MessageReaction } from "discord.js";

import { BuddyProjectEntryRepository } from "../entities/BuddyProjectEntry";
import { textLog } from "../common/moderator";

export default async function BuddyProjectGhost(
  user: User,
  guild: Guild,
  reaction: MessageReaction
): Promise<string> {
  const repo = await BuddyProjectEntryRepository();
  const entry = await repo.findOne(user.id);
  const userDm = await user.createDM();
  let output = `${user.toString()} has reported that they have been ghosted.`;
  const addOutput = (arg: string) => (output = output.concat(`\n${arg}`));
  const cancelReaction = () => reaction.remove();

  if (!entry) {
    userDm.send(
      "You reported that your buddy hasn't replied yet, however you haven't signed up to the buddy project! You can do so by clicking on the speech bubble icon in channel buddy-project on the Yes Theory Fam server."
    );
    addOutput(`User hasn't entered.`);
    cancelReaction();
    return output;
  }

  if (!entry.matched) {
    userDm.send(
      "You reported that your buddy hasn't replied yet, but you don't have a match yet! Please have a little patience in waiting for your buddy :grin:"
    );
    addOutput(`User has no match.`);
    cancelReaction();
    return;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  if (entry.matchedDate > sevenDaysAgo) {
    userDm.send(
      "Have some patience :wink: It's not been 7 days since you have been matched! Try again if your buddy hasn't replied to you more than 7 days after getting mached."
    );
    cancelReaction();
    return;
  }

  if (entry.reportedGhostDate) {
    userDm.send(
      "You already reported that you are possibly being ghosted. I will come back to that report after 7 days in case I haven't heard back from your buddy. Until then, please have some patience."
    );
    return;
  }

  const buddy = guild.member(entry.buddy_id);

  if (!buddy) {
    userDm.send(
      "Huh... Looks like I couldn't find your buddy! I reported that to the support team and have them check it. Expect them to get back to you in a bit!"
    );
    textLog(
      `Heyyo! <@${user.id}> reported that their buddy <@${buddy.id}> hasn't replied yet, however I could not find that user and couldn't create a DM for that reason. Could one of you try to contact them by DM?`
    );
    return;
  }

  const buddyDm = await buddy.createDM();
  const buddyMessage = await buddyDm.send(
    `Hey there! You signed up to the buddy project and got matched with <@${user.id}> (${user.tag}) but never responded to them. In order to not get unmatched, click on the checkmark below this message within the next seven days and send them a message :)`
  );

  // The listener for reactions like these is /events/ReactionAdd because they have to be long term (one week) which isn't feasible with awaitReactions
  // The code running when this happens is in the function below.
  buddyMessage.react("✅");

  entry.reportedGhostDate = new Date();
  await repo.save(entry);

  userDm.send(
    "Hey there! I contacted your buddy with a message asking them to contact you and confirm they received the message. If they didn't confirm that within the next week, you will be unmatched again."
  ); //  (Due to technical reasons checking for ghosted users is done once a day so it might be 7 days and a half before your case is handled; have some patience please :))?
}

export async function BuddyConfirmation(user: User, guild: Guild) {
  if (user.bot) return;

  const repo = await BuddyProjectEntryRepository();
  const entry = await repo.findOne(user.id);

  const userDm = await user.createDM();
  if (!entry) {
    userDm.send(
      "Hey, thanks for the confirmation. Unfortunately you missed the 7 day period and have been unmatched. To reenter the project, click the speech bubble in buddy-project on the Yes Theory Fam Server twice and be sure to stick around so you don't miss your buddy!"
    );
    return;
  }

  const buddy = guild.member(entry.buddy_id);
  const buddyDm = await buddy.createDM();
  buddyDm.send(
    "Looks like your buddy is there indeed! I have just gotten the reaction from them :) Please send them another DM to make it easier to reply."
  );

  userDm.send(
    "Hey, thanks for confirming you are there :) Please, please contact your buddy! They should have sent you a message before so check if you can find that in your DMs. I also asked them to contact you again to make it easier for you to find the DMs with them."
  );

  repo
    .createQueryBuilder()
    .update()
    .set({
      reportedGhostDate: null,
    })
    .where({ user_id: entry.buddy_id })
    .execute();

  // Ideally we probably also want to remove the reaction by the other user that reported the buddy as ghosting but not sure if there is a super sensible way to do this other than resolving the channel, resolving the message, resolving the reaction, removing the user's reaction.
}
