import {
  assignMySupervisor,
  getSupervisorsList,
} from "../services/users.service.js";

export async function getSupervisorsController(req, res) {
  try {
    const result = await getSupervisorsList();

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
}

export async function assignMySupervisorController(req, res) {
  try {
    const result = await assignMySupervisor({
      user: req.user,
      supervisorId: req.body.supervisorId,
    });

    return res.status(200).json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      message: error.message,
    });
  }
}