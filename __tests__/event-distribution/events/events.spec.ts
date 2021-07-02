import {
  addEventHandler,
  extractEventInfo,
} from "../../../src/event-distribution/events/events";
import {
  addMessageHandler,
  extractMessageInfo,
} from "../../../src/event-distribution/events/message";
import { CommandHandler, DiscordEvent } from "../../../src/event-distribution";
import {
  addReactionHandler,
  extractReactionInfo,
} from "../../../src/event-distribution/events/reactions";
import { mocked } from "ts-jest/utils";
import MockDiscord from "../../mocks";
import {
  addReadyHandler,
  extractReadyInfo,
} from "../../../src/event-distribution/events/ready";
import {
  addGuildMemberUpdateHandler,
  extractGuildMemberUpdateInfo,
} from "../../../src/event-distribution/events/guild-member-update";

jest.mock("../../../src/event-distribution/events/guild-member-update");
jest.mock("../../../src/event-distribution/events/message");
jest.mock("../../../src/event-distribution/events/reactions");
jest.mock("../../../src/event-distribution/events/ready");

describe("EventDistribution events", () => {
  const mockedAddMessageHandler = mocked(addMessageHandler, true);
  const mockedAddReactionHandler = mocked(addReactionHandler, true);
  const mockedDiscord = new MockDiscord();

  it("should call addMessageHandler on DiscordEvent.MESSAGE", () => {
    addEventHandler(
      {
        description: "",
        event: DiscordEvent.MESSAGE,
        trigger: "!test",
      },
      {} as CommandHandler<DiscordEvent>,
      {}
    );

    expect(mockedAddMessageHandler).toHaveBeenCalled();
    expect(mockedAddReactionHandler).not.toHaveBeenCalled();
  });

  it("should call addReactionHandler on DiscordEvent.REACTION_REMOVE", () => {
    addEventHandler(
      {
        description: "",
        event: DiscordEvent.REACTION_REMOVE,
        emoji: "♥️",
      },
      {} as CommandHandler<DiscordEvent>,
      {}
    );

    expect(mockedAddMessageHandler).not.toHaveBeenCalled();
    expect(mockedAddReactionHandler).toHaveBeenCalled();
  });

  it("should call addReactionHandler on DiscordEvent.REACTION_ADD", () => {
    addEventHandler(
      {
        description: "",
        event: DiscordEvent.REACTION_ADD,
        emoji: "♥️",
      },
      {} as CommandHandler<DiscordEvent>,
      {}
    );
    expect(mockedAddMessageHandler).not.toHaveBeenCalled();
    expect(mockedAddReactionHandler).toHaveBeenCalled();
  });

  it("should call addGuildMemberUpdateHandler on DiscordEvent.GUILD_MEMBER_UPDATE", () => {
    addEventHandler(
      {
        event: DiscordEvent.GUILD_MEMBER_UPDATE,
      },
      {} as CommandHandler<DiscordEvent>,
      {}
    );

    const mockedAddGuildMemberUpdateHandler = mocked(
      addGuildMemberUpdateHandler,
      true
    );
    expect(mockedAddGuildMemberUpdateHandler).toHaveBeenCalled();
  });

  it("should call addReadyHandler on DiscordEvent.READY", () => {
    addEventHandler(
      { event: DiscordEvent.READY },
      {} as CommandHandler<DiscordEvent>,
      {}
    );

    const mockedAddReadyHandler = mocked(addReadyHandler, true);
    expect(mockedAddReadyHandler).toHaveBeenCalled();
  });

  it("should call extractMessageInfo from message", () => {
    const mockedExtractMessageInfoMock = mocked(extractMessageInfo, true);
    const message = mockedDiscord.getMessage();
    extractEventInfo(DiscordEvent.MESSAGE, message);
    expect(mockedExtractMessageInfoMock).toHaveBeenCalledWith(message);
  });

  it("should call extractReactionInfo from reaction add", () => {
    const mockedExtractReactionInfo = mocked(extractReactionInfo, true);
    const messageReaction = mockedDiscord.getMessageReaction();
    const user = mockedDiscord.getUser();
    extractEventInfo(DiscordEvent.REACTION_ADD, messageReaction, user);
    expect(mockedExtractReactionInfo).toHaveBeenCalledWith(
      messageReaction,
      user
    );
  });

  it("should call extractReactionInfo from reaction remove", () => {
    const mockedExtractReactionInfo = mocked(extractReactionInfo, true);
    const messageReaction = mockedDiscord.getMessageReaction();
    const user = mockedDiscord.getUser();
    extractEventInfo(DiscordEvent.REACTION_REMOVE, messageReaction, user);
    expect(mockedExtractReactionInfo).toHaveBeenCalledWith(
      messageReaction,
      user
    );
  });

  it("should call extractGuildMemberUpdateInfo from guild member update", () => {
    const mockedExtractGuildMemberUpdateInfo = mocked(
      extractGuildMemberUpdateInfo,
      true
    );
    const oldMember = mockedDiscord.getGuildMember();
    const newMember = mockedDiscord.getGuildMember();
    extractEventInfo(DiscordEvent.GUILD_MEMBER_UPDATE, oldMember, newMember);
    expect(mockedExtractGuildMemberUpdateInfo).toHaveBeenCalledWith(
      oldMember,
      newMember
    );
  });

  it("should call extractReadyInfo from ready", () => {
    const mockedExtractReadyInfo = mocked(extractReadyInfo, true);
    const client = mockedDiscord.getClient();
    extractEventInfo(DiscordEvent.READY, client);
    expect(mockedExtractReadyInfo).toHaveBeenCalledWith(client);
  });

  it("should throw an error no event is provided", () => {
    const messageReaction = mockedDiscord.getMessageReaction();
    const user = mockedDiscord.getUser();
    const event = "test" as DiscordEvent;
    expect(() =>
      extractEventInfo(event, messageReaction, user)
    ).toThrowErrorMatchingSnapshot();
  });
});
