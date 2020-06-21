import { Message, User, GuildManager, GuildMember } from "discord.js";
import {
  buddyProjectMatch,
  checkEntry,
  removeEntry,
  checkEntries,
  sendQuestions,
} from "./BuddyProject";
import Tools from "../common/tools";

export default async function BuddyProjectManager(
  message: Message,
  action: string
) {
  switch (action) {
    case "match":
      const usersToMatch = message.mentions.users.array();
      if (usersToMatch.length === 2) {
        message.channel.send(
          `Force matching <@${usersToMatch[0]}> and <@${usersToMatch[1]}>`
        );
        message.channel.send(
          sendQuestions(usersToMatch[0], usersToMatch[1])
            ? `Sent messages.`
            : `Couldn't send messages.`
        );
        buddyProjectMatch(usersToMatch[0], usersToMatch[1], message.guild).then(
          (result) => {
            message.channel.send(
              result ? `Successfully matched.` : `Error in setting match.`
            );
          }
        );
      }
      break;
    case "check":
      message.channel.send(
        await checkEntry(message.mentions.users.array()[0], message.guild)
      );
      break;
    case "unmatch":
      const confirm = await message.reply(
        `Are you sure you would like to remove <@${
          message.mentions.users.array()[0]
        }>'s entry?`
      );
      Tools.addThumbs(confirm);
      const reaction = await Tools.getFirstReaction(confirm);
      if (reaction === "👍")
        message.channel.send(
          await removeEntry(message.mentions.users.array()[0], message.guild)
        );
      break;
    case "clean":
      message.channel.send(await checkEntries(message.guild));
      break;

    case "ghost":
      message.channel
        .send(
          "Have you been ghosted? Do you think you've been ghosted hard enough to warrant a new buddy? Let us know by reacting below."
        )
        .then((sentMsg) => sentMsg.react("👻"));

    default:
      break;
  }
}
