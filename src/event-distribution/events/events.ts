import {
  addMessageHandler,
  extractMessageInfo,
  MessageEventHandlerOptions,
  MessageHandlerFunction,
} from "./message";
import {
  AddEventHandlerFunction,
  DiscordEvent,
  ExtractInfoFunction,
} from "../types/base";
import {
  addReactionHandler,
  extractReactionInfo,
  ReactionEventHandlerOptions,
  ReactionHandlerFunction,
} from "./reactions";
import { StringIndexedHIOCTree } from "../types/hioc";
import { Client, Message, MessageReaction, User } from "discord.js";
import {
  addGuildMemberUpdateHandler,
  extractGuildMemberUpdateInfo,
  GuildMemberUpdateArgument,
  GuildMemberUpdateEventHandlerOptions,
  GuildMemberUpdateHandlerFunction,
} from "./guild-member-update";
import {
  addReadyHandler,
  extractReadyInfo,
  ReadyEventHandlerOptions,
  ReadyHandlerFunction,
} from "./ready";

export type EventHandlerOptions =
  | MessageEventHandlerOptions
  | ReactionEventHandlerOptions
  | ReadyEventHandlerOptions
  | GuildMemberUpdateEventHandlerOptions;

export type HandlerFunction<T extends DiscordEvent> =
  | MessageHandlerFunction<T>
  | ReactionHandlerFunction<T>
  | ReadyHandlerFunction<T>
  | GuildMemberUpdateHandlerFunction<T>;

export const addEventHandler: AddEventHandlerFunction<EventHandlerOptions> = (
  options,
  ioc,
  tree
) => {
  switch (options.event) {
    case DiscordEvent.MESSAGE:
      return addMessageHandler(
        options,
        ioc,
        tree as StringIndexedHIOCTree<DiscordEvent.MESSAGE>
      );
    case DiscordEvent.REACTION_ADD:
    case DiscordEvent.REACTION_REMOVE:
      return addReactionHandler(
        options,
        ioc,
        tree as StringIndexedHIOCTree<
          DiscordEvent.REACTION_ADD | DiscordEvent.REACTION_REMOVE
        >
      );
    case DiscordEvent.GUILD_MEMBER_UPDATE:
      return addGuildMemberUpdateHandler(
        options,
        ioc,
        tree as StringIndexedHIOCTree<DiscordEvent.GUILD_MEMBER_UPDATE>
      );
    case DiscordEvent.READY:
      return addReadyHandler(
        options,
        ioc,
        tree as StringIndexedHIOCTree<DiscordEvent.READY>
      );
  }
};

export const extractEventInfo: ExtractInfoFunction<DiscordEvent> = (
  event,
  ...args
) => {
  const getInfos = () => {
    switch (event) {
      case DiscordEvent.MESSAGE:
        return extractMessageInfo(args[0] as Message);
      case DiscordEvent.REACTION_ADD:
      case DiscordEvent.REACTION_REMOVE:
        return extractReactionInfo(args[0] as MessageReaction, args[1] as User);
      case DiscordEvent.GUILD_MEMBER_UPDATE:
        return extractGuildMemberUpdateInfo(
          args[0] as GuildMemberUpdateArgument,
          args[1] as GuildMemberUpdateArgument
        );
      case DiscordEvent.READY:
        return extractReadyInfo(args[0] as Client);
      default:
        throw new Error("Could not extract info for event " + event);
    }
  };
  const infos = getInfos();

  return Array.isArray(infos) ? infos : [infos];
};
