use anchor_lang::prelude::*;

declare_id!("9cdrcYFonADBKCEgLFJfkTMBYAYUzdG61h58hMx1nnvP");

// for admin only update
pub const ADMIN: Pubkey = pubkey!("EdyfuA8XdLjmSafUxVUuhmMZSFVXZ8u4G1MTLTtZDyNk");

#[program]
pub mod exam_grade_storage {
    use super::*;

    pub fn set_exam_grade(ctx: Context<SetExamGrade>, student_id: String, grade: u8) -> Result<()> {
        require!(!student_id.trim().is_empty(), ExamError::EmptyStudentId);
        require!(grade <= 10, ExamError::InvalidGrade);

        // admin-only
        require_keys_eq!(ctx.accounts.authority.key(), ADMIN, ExamError::NotAdmin);

        let acct = &mut ctx.accounts.exam_grade;

        // global per student_id (PDA determinist)
        if !acct.exists {
            acct.student_id = student_id.clone();
            acct.exists = true;
        } else {
            // student_id must match account
            require!(acct.student_id == student_id, ExamError::StudentMismatch);
        }

        acct.value = grade;

        emit!(ExamGradeUpdated { student_id, grade });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(student_id: String)]
pub struct SetExamGrade<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = ExamGradeAccount::SPACE,
        seeds = [b"exam_grade", student_id.as_bytes()],
        bump
    )]
    pub exam_grade: Account<'info, ExamGradeAccount>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct ExamGradeAccount {
    pub student_id: String,
    pub value: u8,
    pub exists: bool,
}

impl ExamGradeAccount {
    pub const STUDENT_ID_MAX: usize = 64;
    pub const SPACE: usize = 8 + 4 + Self::STUDENT_ID_MAX + 1 + 1;
}

#[event]
pub struct ExamGradeUpdated {
    pub student_id: String,
    pub grade: u8,
}

#[error_code]
pub enum ExamError {
    #[msg("Empty studentId")]
    EmptyStudentId,
    #[msg("Invalid grade (must be 0..10)")]
    InvalidGrade,
    #[msg("Only admin can set exam grades")]
    NotAdmin,
    #[msg("StudentId mismatch")]
    StudentMismatch,
}
