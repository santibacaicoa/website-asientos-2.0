import {
  findSupervisors,
  updateUserSupervisor,
} from "../repositories/users.repository.js";

export async function getSupervisorsList() {
  const supervisors = await findSupervisors();

  return {
    supervisors,
  };
}

export async function assignMySupervisor({ user, supervisorId }) {
  if (user.rol !== "empleado") {
    throw new Error("Solo los procesadores pueden asignarse supervisor.");
  }

  if (!supervisorId) {
    throw new Error("El supervisor es obligatorio.");
  }

  const supervisors = await findSupervisors();

  const supervisorExists = supervisors.some(
    (supervisor) => Number(supervisor.id) === Number(supervisorId)
  );

  if (!supervisorExists) {
    throw new Error("El supervisor seleccionado no existe.");
  }

  const updatedUser = await updateUserSupervisor({
    userId: user.id,
    supervisorId,
  });

  if (!updatedUser) {
    throw new Error("No se pudo actualizar el supervisor.");
  }

  return {
    message: "Supervisor asignado correctamente.",
    user: updatedUser,
  };
}