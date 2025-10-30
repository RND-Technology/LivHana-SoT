### Character Consistency Across Episodes

**LoRA Training Workflow:**

1. **Collect Training Data (20-50 images):**
   - Generate 50 images of Liv using Midjourney with Omni Reference
   - Various angles: front, 3/4, profile, back
   - Various expressions: neutral, smiling, surprised, serious
   - Various poses: standing, sitting, gesturing

2. **Train Custom LoRA (Stable Diffusion):**

   ```
   Training tool: Kohya_ss or EveryDream2
   Training images: 50 images of Liv
   Training steps: 1500-2000
   Learning rate: 0.0001
   Resolution: 1024x1024
   ```

3. **Use LoRA in Production:**

   ```
   Prompt: "livhnc, speaking to camera, office background" <lora:liv_character:0.8>
   ```

   - LoRA ensures Liv looks identical across all scenes/episodes
   - No need for Omni Reference every time

4. **Export to Video Tools:**
   - Use LoRA-generated consistent images in Kling AI/HeyGen
   - Maintain perfect character consistency across 100+ episodes

---
