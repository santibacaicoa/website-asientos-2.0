import {
  getAvailableChannels,
  getChannelMessages,
  sendChannelMessage,
} from "../services/chat.service.js";

export async function getChatChannelsController(req, res) {
  try {
    const channels = getAvailableChannels({
      user: req.user,
    });

    return res.status(200).json({
      ok: true,
      channels,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function getChatMessagesController(req, res) {
  try {
    const result = await getChannelMessages({
      user: req.user,
      channel: req.params.channel,
    });

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(403).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function sendChatMessageController(req, res) {
  try {
    const result = await sendChannelMessage({
      user: req.user,
      channel: req.params.channel,
      message: req.body.message,
    });

    return res.status(201).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(403).json({
      ok: false,
      message: error.message,
    });
  }
}