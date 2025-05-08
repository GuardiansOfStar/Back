import {Router, Request, Response} from "express";
import {db, getById} from "../services/firestore";
const router = Router();

/**
 * @openapi
 * /villages:
 *   get:
 *     summary: 마을 목록 조회
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/", async (_req: Request, res: Response) => {
  const snap = await db.collection("villages").get();
  const list = snap.docs.map((d) => ({village_id: d.id, ...d.data()}));
  return res.json(list);
});

/**
 * @openapi
 * /villages/{village_id}:
 *   get:
 *     summary: 마을 상세 조회
 *     parameters:
 *       - in: path
 *         name: village_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 성공
 */
router.get("/:id", async (req: Request, res: Response) => {
  const data = await getById("villages", req.params.id);
  if (!data) return res.status(404).json({error: "Not found"});
  return res.json({village_id: req.params.id, ...data});
});

export default router;
