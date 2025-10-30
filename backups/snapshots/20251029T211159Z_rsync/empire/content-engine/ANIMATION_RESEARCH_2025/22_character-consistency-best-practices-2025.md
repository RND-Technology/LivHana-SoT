### Character Consistency Best Practices (2025)

**Technical Approaches:**

1. **LoRA Training:**
   - Train custom LoRA model on your characters
   - Model "remembers" character deeply
   - Best for long-form video series
   - Tools: Stable Diffusion XL, Flux models

2. **Anchor Frames:**
   - Create key frames with locked style, pose, emotion
   - Use as guideposts across animation
   - Maintain consistency between generations

3. **Prompt Chaining:**
   - Change only 1-2 elements per frame
   - Create believable motion
   - Maintain character features

4. **Latent Reuse:**
   - Preserve character features in latent space
   - Ensures cohesion across frames

**Recommended Workflow:**

```
Midjourney Character Design → LoRA Training (optional) →
Omni Reference for variants → Export to Kling/Runway for animation
```

---
