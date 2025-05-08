import {Router, Request, Response} from "express";
import admin from "firebase-admin";
import {db, getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /sessions:
 *   post:
 *     summary: 세션 시작
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id: { type: string }
 *               scenario_id: { type: string }
 *     responses:
 *       200:
 *         description: session ID
 */
router.post("/", async (req: Request, res: Response) => {
  const now = admin.firestore.Timestamp.now();
  const ref = await db.collection("sessions").add({...req.body, start_time: now});
  return res.json({session_id: ref.id});
});

/**
 * @openapi
 * /sessions/{session_id}:
 *   get:
 *     summary: 세션 조회
 *     parameters:
 *       - in: path
 *         name: session_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:id", async (req: Request, res: Response) => {
  const data = await getById("sessions", req.params.id);
  if (!data) return res.status(404).json({error: "Not found"});
  return res.json({session_id: req.params.id, ...data});
});

export default router;
