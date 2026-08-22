import express from 'express';
import auth from '../../middlewares/auth';
import { WishlistController } from './wishlist.controller';

const router = express.Router();

router.use(auth());

router.get('/', WishlistController.getWishlist);
router.post('/', WishlistController.addToWishlist);
router.delete('/:productId', WishlistController.removeFromWishlist);

export const WishlistRoutes = router;
